# DEVTOOLS Production Discovery Audit

## Scope and current inventory

The current production inventory is **14 canonical pages**: the utility directory, eleven standalone browser-local tools, and three trust pages. Each permanent tool has a clean lower-case route, a unique title and description in the tool registry, an H1, user-visible explanatory copy, FAQs, related-tool links, and sitemap coverage. The global workbench rail also links to every utility, so no current tool route is orphaned.

## Technical SEO findings

| Area | Finding | Impact | Proposed fix | Status |
|---|---|---|---|---|
| Canonical metadata | Canonicals are set dynamically, but the shared metadata helper has no explicit noindex path for the client-rendered 404 route. | A non-canonical fallback could inherit indexable defaults. | Add per-page robot directives and mark the 404 fallback `noindex, nofollow`. | Planned |
| Home metadata | The directory relies on generic fallback copy rather than an explicit homepage metadata object. | The home route has less intentional keyword and product positioning than tool routes. | Give the directory a route-specific title, description, canonical, and Website schema. | Planned |
| Structured data | Tool routes emit truthful `WebApplication` schema, but lack a site-wide identity reference. | Search engines receive less connected entity context across tool pages. | Add an `isPartOf` Website reference to tool schema. | Planned |
| Open Graph baseline | The document has an Open Graph site name and per-route title/description/URL, but no image. | Shared links will remain text-led. | Do not fabricate a decorative image; retain truthful text-only social metadata until an intentional branded share asset exists. | Accepted |
| Crawlability | `robots.txt` allows crawling and points to a production sitemap; the sitemap lists all current permanent pages once. | No blocker found. | Retain and validate after future route changes. | Verified |
| Internal discovery | Tool routes expose meaningful related tools and the directory/rail link to every tool. A breadcrumb trail is not present. | Existing discovery is sound; explicit route context can improve orientation and reinforce hierarchy. | Add a compact directory-to-tool context link rather than a bulky breadcrumb system. | Planned |
| Client-side routing | Tool routes are client rendered and lazy loaded. | First-wave crawler rendering can be less reliable than static rendering. | Keep metadata and visible content present after client render; reassess prerendering only if search data shows a crawl/indexing issue. | Monitoring |

## Search-intent and content findings

The eleven utilities have distinct task intent. The JSON cluster deliberately separates syntax validation, formatting, minification, comparison, conversion, normalization, type declaration generation, and schema inference. The security cluster states important limitations: JWT decoding does not verify a signature and Base64 is not encryption. These pages should remain concise because the utility workflow is the primary content.

The current related-tool graph is intentional rather than a generic all-tools list. The next refinement should add context from the directory without introducing a long article, keyword repetition, unrelated templates, fake examples, or advertising clutter.

## Measurement and privacy findings

| Area | Finding | Risk | Proposed fix | Status |
|---|---|---|---|---|
| Page views | The document shell loads a configured Umami-compatible script, but there is no application-level event wrapper. | Product decisions cannot distinguish route visits from successful workbench actions. | Add a no-op-safe event helper that emits only a whitelisted event name and non-content metadata. | Planned |
| Interaction events | Tool execution, success/error outcome, examples, copy/download, and related-tool navigation are currently unmeasured. | The product cannot evaluate utility quality, journey flow, or recurring error patterns. | Instrument those actions with tool slug and safe dimensions only. | Planned |
| Sensitive input | Tool values can contain JSON, JWTs, Base64, and secrets. | Recording raw values, lengths, error text, or option names derived from input would violate local-first expectations. | Hard-ban values, output, file names, tokens, JSON, error stacks, and free-form labels from events. | Planned |
| Error monitoring | The error boundary exposes the raw stack to users and reports nothing. | Debug information may be unnecessarily visible; systematic runtime failure patterns are unavailable. | Show a stable human-readable recovery state and send only sanitized error type/message name plus current path through the event wrapper. | Planned |
| Disclosure | Privacy content mentions analytics and hosting logs but does not name the restricted event categories. | The product can be clearer without overstating anonymity guarantees. | Update the privacy page with an explicit “never collected from tool input” statement. | Planned |

## Event taxonomy and privacy boundary

The implementation should record only these event names: `tool_execute`, `tool_success`, `tool_error`, `example_loaded`, `copy_clicked`, `download_clicked`, `related_tool_clicked`, `tool_navigation_clicked`, and `application_error`.

Allowed dimensions are fixed, low-risk values such as `tool_slug`, `tool_category`, `action`, `outcome`, `source`, `route_kind`, and `error_kind`. Events must never contain pasted or loaded text, transformed output, JWT segments, Base64, JSON, file names, clipboard contents, parser text, stack traces, inferred schema/type labels, or locally selected preference values. The helper must be safe when the analytics script is absent.

## Future utility evaluation scorecard

Each proposed utility should be scored before implementation. A candidate proceeds only when it has a distinct user intent, a browser-local implementation path, an understandable failure state, useful output or follow-up action, and a non-duplicative route. The weighted assessment below turns future decisions into evidence-led work rather than a volume expansion.

| Criterion | Weight | Evidence required before approval |
|---|---:|---|
| Distinct search and workflow intent | 25% | Query pattern, user task, and a route that is not a synonym of an existing tool |
| Local-first technical feasibility | 20% | Deterministic browser implementation and realistic input-size behavior |
| Workflow completeness | 15% | Valid, invalid, empty, edge, and output/copy/download or next-step behavior |
| Product adjacency | 15% | A meaningful predecessor or follow-up tool journey |
| Trust and safety clarity | 10% | Honest limitations and no sensitive-data collection requirement |
| Maintenance and performance cost | 10% | Test plan, dependency impact, and bundle strategy |
| Search-data support | 5% | Search Console or analytics evidence after launch, or a documented research hypothesis before launch |

## Search-data requirements before the next expansion

Connect Search Console and observe impressions, clicks, CTR, indexed-page coverage, queries, and crawl issues by canonical route. Compare those data with the safe workbench events: route views, executes, successes, errors, examples, copy/download actions, and adjacent-tool navigation. Segment only by page and tool metadata—not user input. The next expansion should follow a measured pattern such as high query impressions with weak coverage, high execution demand with low success, or strong related-tool continuation.

## Remaining constraints

The current static client architecture cannot guarantee server-returned HTTP 404 status or prerendered per-route metadata. It should not be replaced solely for speculative SEO. Monitor crawl/indexing data first; add static prerendering or server routing only if concrete evidence justifies the operational complexity.
