# Chaos Laboratory Website

This repository contains the source code for the Chaos Laboratory research group website, built with MkDocs and the Material theme.

## 🎨 Adding Your Logo

To add the Chaos Laboratory logo to the website:

1. Place your logo file in the `docs/assets/` directory
2. Name it `logo.png` (or update the path in `mkdocs.yml`)
3. Recommended size: 200x200 pixels or larger
4. For best results, use a transparent background

See `docs/assets/README.md` for detailed instructions.

## 🚀 Quick Start

### Prerequisites

- Python 3.x
- pip

### Installation

Install MkDocs and the Material theme:

```bash
pip install mkdocs mkdocs-material
```

### Local Development

To run the website locally with live reload:

```bash
mkdocs serve
```

Then open your browser to `http://127.0.0.1:8000/`

### Building the Site

To build the static website:

```bash
mkdocs build
```

The built site will be in the `site/` directory.

## 📁 Site Structure

- `docs/` - Contains all the Markdown content for the website
  - `index.md` - Home page
  - `team.md` - Team members and information
  - `research.md` - Research projects and areas
  - `software.md` - Software and tools developed by the lab
  - `publications.md` - Research publications
  - `blog.md` - News, commentary, and articles
  - `assets/` - Images, logos, and other static assets
- `mkdocs.yml` - MkDocs configuration file
- `site/` - Built website (generated, not in git)

## ✏️ Editing Content

1. Edit the Markdown files in the `docs/` directory
2. Preview your changes with `mkdocs serve`
3. Commit and push your changes

## 🎨 Customization

The website appearance can be customized by editing `mkdocs.yml`:

- **Colors:** Modify the `theme.palette` section
- **Navigation:** Update the `nav` section
- **Logo:** Change `theme.logo` path
- **Features:** Enable/disable features in `theme.features`

## 📚 Documentation

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs Documentation](https://squidfunk.github.io/mkdocs-material/)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
