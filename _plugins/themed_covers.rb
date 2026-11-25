# Themed, cropped article covers.
#
# Every article starts with ![Title](cover.svg): a 2752x1536 drawing with the
# title at y=880 and the drawings above it. On the site the cover is shown
# inline instead of as an <img>, so that it can:
#
#   - start just above the title (the drawings above it are cropped away),
#   - follow the reader's palette: each colour in the SVG is replaced by a
#     theme variable according to its role (background -> transparent, light
#     fills -> --bg-alt, greys -> --border / --muted / --fg, the cover's main
#     brand colour -> --accent, other colours -> --accent-2, title -> --accent).
#
# The SVG files themselves are not changed (GitHub and og.png keep the original).

require "digest"

module TTY
  module ThemedCovers
    COVER_IMG = %r{<p>\s*<img src="[^"]*/?cover\.svg" alt="[^"]*"\s*/?>\s*</p>|<img src="[^"]*/?cover\.svg" alt="[^"]*"\s*/?>}
    HEX = /#(?:\h{6}|\h{3})\b/
    TITLE = /<text class="h"[^>]*?\by="(\d+(?:\.\d+)?)"[^>]*?font-size="(\d+(?:\.\d+)?)"/
    KEEP = %w[#ff5f57 #febc2e #28c840].freeze # window "traffic light" dots

    module_function

    def cache
      @cache ||= {}
    end

    def inline(page)
      return unless page.output&.include?('cover.svg"')

      file = File.join(page.site.source, File.dirname(page.path), "cover.svg")
      return unless File.exist?(file)

      svg = File.read(file, encoding: "UTF-8")
      key = Digest::SHA1.hexdigest(svg)
      themed = (cache[key] ||= transform(svg, "cv-#{key[0, 8]}"))
      page.output = page.output.sub(COVER_IMG) do
        %(<figure class="cover" data-pagefind-ignore>#{themed}</figure>)
      end
    end

    def transform(svg, scope)
      bg = svg[/\.bg\s*\{\s*fill:\s*(#\h+)/, 1]&.downcase
      brand = brand_colour(svg, bg)
      map = ->(hex) { role(normalise(hex), bg, brand) }

      # Crop: from just above the title to the bottom.
      _, _, width, height = svg[/viewBox="([^"]+)"/, 1].split.map(&:to_f)
      if (t = svg.match(TITLE))
        top = [t[1].to_f - t[2].to_f * 0.82 - 22, 0].max.floor
        svg = svg.sub(/viewBox="[^"]+"/, %(viewBox="0 #{top} #{width.to_i} #{(height - top).to_i}"))
      end
      svg = svg.sub(/\swidth="[\d.]+"\s+height="[\d.]+"/, "")

      # Styles: drop the dark-mode blocks, scope every selector, map colours.
      svg = svg.gsub(%r{<style>(.*?)</style>}m) do
        css = Regexp.last_match(1).gsub(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/m, "")
        css = css.gsub(/([^{}]+)\{([^{}]*)\}/m) do
          sels, decls = Regexp.last_match(1), Regexp.last_match(2)
          scoped = sels.split(",").map { |s| ".#{scope} #{s.strip}" }.join(", ")
          decls = decls.gsub(HEX) { |h| map.call(h) }
          decls = "fill: transparent;" if sels.strip == ".bg"
          "#{scoped} {#{decls}}\n"
        end
        "<style>#{css}.#{scope} .h { fill: var(--accent); }</style>"
      end

      # Colours written as attributes (fill="#fff" on glyphs and dots).
      svg = svg.gsub(/((?:fill|stroke)=")(#\h{3,6})(")/) { "#{$1}#{map.call($2)}#{$3}" }

      # Unique ids, so aria-labelledby keeps working next to other SVGs.
      svg = svg.gsub(/\bid="(\w+)"/) { %(id="#{scope}-#{$1}") }
               .gsub(/aria-labelledby="([^"]+)"/) { %(aria-labelledby="#{$1.split.map { |i| "#{scope}-#{i}" }.join(' ')}") }
               .gsub(/url\(#(\w+)\)/) { "url(##{scope}-#{$1})" }

      svg.sub("<svg ", %(<svg class="cover-svg #{scope}" ))
    end

    def role(hex, bg, brand)
      return hex if KEEP.include?(hex)
      return "var(--bg)" if hex == bg

      l, s = hls(hex)
      return "var(--bg-alt)" if l >= 0.9
      if s >= 0.3
        hex == brand ? "var(--accent)" : "var(--accent-2)"
      elsif l >= 0.8 then "var(--border)"
      elsif l >= 0.5 then "var(--muted)"
      else "var(--fg)"
      end
    end

    # The most used saturated colour below the title row is the cover's brand colour.
    def brand_colour(svg, bg)
      counts = Hash.new(0)
      svg.scan(HEX) do |h|
        h = normalise(h)
        next if KEEP.include?(h) || h == bg

        l, s = hls(h)
        counts[h] += 1 if s >= 0.3 && l < 0.9
      end
      counts.max_by { |_, n| n }&.first
    end

    def normalise(hex)
      h = hex.downcase.delete("#")
      h = h.chars.map { |c| c * 2 }.join if h.size == 3
      "##{h}"
    end

    def hls(hex)
      r, g, b = hex[1..].scan(/../).map { |c| c.to_i(16) / 255.0 }
      max, min = [r, g, b].max, [r, g, b].min
      l = (max + min) / 2
      d = max - min
      s = d.zero? ? 0 : d / (1 - (2 * l - 1).abs)
      [l, s]
    end
  end
end

Jekyll::Hooks.register :pages, :post_render do |page|
  TTY::ThemedCovers.inline(page)
end
