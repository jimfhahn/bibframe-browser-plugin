# BIBFRAMINATOR Browser Plugin

[BIBFRAMinator](https://addons.mozilla.org/en-US/firefox/addon/bibframinator/) enhances the Penn Libraries' catalog by adding thumbnails and an 'Author/Creator Knowledge Card' button to catalog pages. It fetches data from Wikidata and Share-VDE to provide additional information about authors and works.

## Usage

- The plugin automatically loads and injects modal HTML when visiting catalog search pages.
- It extracts IDs parsing the HTML of the catalog results and fetches data from remote APIs.
- It handles search results and updates sidebars accordingly.

## Features

- **Thumbnail Display**: Load and display thumbnail images for catalog items.
- **Modal Injection**: Inject and initialize modal HTML for detailed views.
- **Data Fetching**: Fetch data from APIs based on IDs extracted from URLs.
- **Search Handling**: Update sidebars with search results and related author information.

## Dependencies

### Uses a modified SQID website. 
Fork with modifications are here: https://github.com/jimfhahn/SQID

Demonstration SQID with Share-VDE data at https://id.bibframe.app/entity/Q1339 

### Middleware 
Middleware adapts GraphQL queries from Share-VDE for SQID display. Code for middleware is in active development, not open sourced (yet).
