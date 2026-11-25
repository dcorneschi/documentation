"""Lenient code highlighting.

Sphinx highlights code blocks with Pygments in strict mode: one token the lexer
does not understand (common with real HCL, Helm templates or shell output) and
the whole block falls back to plain text with a warning.  Here every language
used in the articles gets a pre-built lexer whose Error tokens are emitted as
plain text, so the rest of the block keeps its colors.  Lexers in
``sphinx.highlighting.lexers`` are used as-is, without the strict filter.

Also maps a few fence names Pygments does not know (``env``, ``conf``,
``gitignore``) to a close lexer.
"""

from pygments.filter import Filter
from pygments.lexers import get_lexer_by_name
from pygments.token import Error, Text
from sphinx.highlighting import lexers

LANGUAGES = [
    "bash", "sh", "shell", "console", "text", "yaml", "yml", "hcl", "terraform", "tf",
    "json", "ini", "dockerfile", "xml", "toml", "python", "php", "go", "sql",
    "powershell", "nginx", "jinja", "diff",
]

ALIASES = {
    "env": "bash",        # KEY=value files
    "conf": "ini",        # kitty.conf and similar
    "gitignore": "text",
}


class ErrorToText(Filter):
    def filter(self, lexer, stream):
        for ttype, value in stream:
            yield (Text if ttype is Error else ttype), value


def _lenient(name):
    lexer = get_lexer_by_name(name, stripnl=False, ensurenl=False)
    lexer.add_filter(ErrorToText())
    return lexer


def setup(app):
    for name in LANGUAGES:
        lexers.setdefault(name, _lenient(name))
    for alias, target in ALIASES.items():
        lexers.setdefault(alias, _lenient(target))
    return {"parallel_read_safe": True, "parallel_write_safe": True}
