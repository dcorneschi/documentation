# Builds the site navigation from README.md, so the README stays the single
# list of articles:
#
#   ## AWS                                  -> a category
#   - [Title](aws-cli-install/index.md)     -> an article in it
#
# Result: site.data["nav"] = [{ "title", "id", "pages" => [{ "title", "url", "slug" }] }]
# and on every article page: category, category_id, prev, next, and image (og.png).
# The build fails if the README links an article that does not exist, or if an
# article folder is missing from the README.
#
# site.data["latest"] lists the 10 newest articles for the home page, and
# site.data["activity"] a year of publication dates (GitHub-style graph). An article's
# date is its blog publication date from _data/published.yml, otherwise the date of
# the git commit that added its index.md (CI needs the full history for that:
# fetch-depth: 0), otherwise now (not committed yet).

require "date"
require "open3"
require "time"

module TTY
  class ReadmeNav < Jekyll::Generator
    safe true
    priority :lowest # after jekyll-optional-front-matter has created the pages

    SECTION = /\A## +(.+?)\s*\z/
    ENTRY = /\A- \[(.+)\]\(([^)\/]+)\/index\.md\)\s*\z/

    def generate(site)
      readme = File.join(site.source, "README.md")
      pages_by_slug = site.pages.each_with_object({}) do |page, map|
        slug = page.path.sub(%r{/index\.md\z}, "")
        map[slug] = page if page.path.end_with?("/index.md") && !slug.include?("/")
      end

      nav = []
      File.foreach(readme, chomp: true, encoding: "UTF-8") do |line|
        if (m = SECTION.match(line))
          nav << { "title" => m[1], "id" => slugify(m[1]), "pages" => [] }
        elsif (m = ENTRY.match(line)) && nav.any?
          slug = m[2]
          page = pages_by_slug[slug] or
            raise Jekyll::Errors::FatalException, "README.md links #{slug}/index.md, which does not exist"
          nav.last["pages"] << { "title" => m[1], "url" => page.url, "slug" => slug }
        end
      end

      listed = nav.flat_map { |c| c["pages"].map { |p| p["slug"] } }
      missing = pages_by_slug.keys - listed
      unless missing.empty?
        raise Jekyll::Errors::FatalException, "Articles missing from README.md: #{missing.sort.join(', ')}"
      end

      site.data["nav"] = nav
      site.data["article_count"] = listed.size

      nav.each do |cat|
        cat["pages"].each_with_index do |entry, i|
          page = pages_by_slug[entry["slug"]]
          page.data["category"] = cat["title"]
          page.data["category_id"] = cat["id"]
          page.data["prev"] = cat["pages"][i - 1] if i.positive?
          page.data["next"] = cat["pages"][i + 1]
          og = File.join(site.source, entry["slug"], "og.png")
          page.data["image"] ||= "/#{entry['slug']}/og.png" if File.exist?(og)
          # The cover already shows the title (see themed_covers.rb).
          page.data["has_cover"] = File.exist?(File.join(site.source, entry["slug"], "cover.svg"))
          page.data["published"] = entry["date"] = published_date(site, entry["slug"])
        end
      end

      # Newest first; on equal dates keep the README order.
      order = listed.each_with_index.to_h
      newest = nav.flat_map { |cat| cat["pages"].map { |p| p.merge("category" => cat["title"], "category_id" => cat["id"]) } }
                  .sort_by { |p| [-p["date"].to_i, order[p["slug"]]] }
      site.data["latest"] = newest.first(10)
      site.data["activity"] = activity(newest)
    end

    private

    # GitHub-style activity graph of the last year: one column per week (Sunday
    # first), one cell per day, the level is the number of articles published
    # that day (0..4, 4 = four or more). Days after the build date are nil.
    def activity(pages)
      today = Date.today
      start = today - 364
      start -= start.wday # back to Sunday
      by_day = pages.group_by { |p| p["date"].to_date }

      weeks = []
      months = []
      (start..today).each_slice(7) do |days|
        col = weeks.size
        first = days.find { |d| d.mday == 1 } || (col.zero? && days.first)
        months << { "col" => col + 1, "label" => first.strftime("%b") } if first && !(col.zero? && first.mday > 14) # no label crammed next to the next month's
        weeks << days.map do |d|
          titles = (by_day[d] || []).map { |p| p["title"] }
          { "date" => d.iso8601, "count" => titles.size, "level" => [titles.size, 4].min, "titles" => titles }
        end
        weeks.last.fill(nil, weeks.last.size...7)
      end

      total = by_day.select { |d, _| d >= start && d <= today }.sum { |_, ps| ps.size }
      { "weeks" => weeks, "months" => months, "total" => total, "from" => start.iso8601, "to" => today.iso8601 }
    end

    def published_date(site, slug)
      from_blog = (site.data["published"] || {})[slug]
      return to_time(from_blog) if from_blog

      out, status = Open3.capture2("git", "-C", site.source, "log", "--diff-filter=A", "--format=%cI", "--", "#{slug}/index.md")
      added = out.lines.last&.strip if status.success?
      added && !added.empty? ? Time.parse(added) : Time.now
    end

    def to_time(value)
      value.is_a?(Time) ? value : Time.parse(value.to_s)
    end

    def slugify(text)
      Jekyll::Utils.slugify(text.gsub("&", "and"))
    end
  end
end
