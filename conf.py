# Sphinx configuration for the DevOps Wiki.
# Articles stay as plain Markdown (one folder per article, <slug>/index.md),
# read by MyST-Parser, so they keep rendering on GitHub too.

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "_ext"))

project = "DevOps Wiki"
author = "Daniel Corneschi"
copyright = "2026, Daniel Corneschi"

extensions = [
    "myst_parser",
    "sphinx_copybutton",
    "lenient_lexers",  # _ext/lenient_lexers.py
    "sphinx.ext.githubpages",  # writes .nojekyll
]
html_baseurl = "https://dcorneschi.github.io/documentation/"

root_doc = "index"
source_suffix = {".md": "markdown"}

# The repo root is the source dir: skip everything that is not an article.
exclude_patterns = [
    "_build",
    "_ext",
    ".venv",
    ".claude",
    ".github",
    "README.md",  # GitHub landing page; index.md is the Sphinx one
    "CLAUDE.md",
    "**/.DS_Store",
]

# MyST: GitHub-style Markdown
myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "strikethrough",
    "tasklist",
    "attrs_inline",
]
myst_heading_anchors = 4  # generate slugs so [text](#some-heading) links resolve
suppress_warnings = ["myst.strikethrough"]  # strikethrough is HTML-only, fine here

# Fences without a language stay plain (most are command output).
highlight_language = "none"

# HTML output
html_theme = "furo"
html_title = "DevOps Wiki"
html_copy_source = False
html_show_sourcelink = False
html_theme_options = {
    "source_repository": "https://github.com/dcorneschi/documentation/",
    "source_branch": "main",
    "source_directory": "",
    "navigation_with_keys": True,
}

copybutton_prompt_text = r"^\$ "
copybutton_prompt_is_regexp = True
