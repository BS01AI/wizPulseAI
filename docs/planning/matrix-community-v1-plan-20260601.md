# WizPulseAI Matrix Community V1 Plan

Date: 2026-06-01

## Purpose

Build a lightweight matrix-level community system that gives WizPulseAI and each app a place for user activity, feedback, and sharing, without letting every app build its own isolated social stack.

The first version should be practical, low-cost, and moderation-ready. It should not become a full social network yet.

## Product Direction

Use one shared community core:

- Matrix account owns identity, nickname, avatar, role, and moderation state.
- Community data lives in the Dashboard/database app.
- Each app gets a board or app-scoped entry point.
- Main site can show selected community entry points or featured posts later.
- iOS apps can read and write the same app-scoped boards later through API.

Do not build separate forum systems for Magicoord, ExpoGeo, and Dino Kids.

## V1 Scope

### User Features

- Browse boards.
- Browse posts.
- Search or filter by board.
- Current UI language posts are prioritized by default.
- User can switch content filter to:
  - current language
  - all languages
  - specific language
- Logged-in users can create posts.
- Logged-in users can reply.
- Logged-in users can upload limited images.
- Logged-in users can like posts or replies.
- Logged-in users can report posts, replies, or media.
- Users can delete or hide their own posts/replies if allowed by policy.

### Admin Features

- View posts, replies, media, and reports.
- Hide or restore posts.
- Hide or restore replies.
- Hide media.
- Mark report as reviewed, accepted, rejected, or resolved.
- Filter by board, app, language, status, report status, and user.

### Not In V1

- Private messages.
- Follow system.
- Algorithmic feed.
- Real-time chat.
- Paid boosts or promoted posts.
- AI translation.
- AI moderation as a blocking dependency.
- Public user profile pages beyond basic author display.

## Boards

Initial boards:

| Board | product_code | Purpose |
| --- | --- | --- |
| Matrix General | null | Whole-platform discussion and announcements |
| Feedback | null | Product feedback, requests, bug reports |
| ExpoGeo | expo_geo | Country learning discussion |
| Dino Kids | dino_kids | Dinosaur learning discussion |
| Magicoord | magicoord | Fashion and outfit sharing |

Boards should support `visibility` so Magicoord can stay limited while public entry is paused.

## Language Strategy

Separate UI language from content language.

- UI language follows the existing matrix locale system.
- User content stores its own `language_code`.
- Posts and replies keep the original text.
- Default list ordering prioritizes the current UI language.
- Users can choose all languages or a specific language.
- Automatic translation is a future extension.

Example order rule:

```sql
order by
  case when language_code = :current_locale then 0 else 1 end,
  created_at desc
```

Use canonical language codes:

- `ja`
- `en`
- `zh-TW`
- `zh-CN`
- `unknown`

App-specific supported languages can be narrower, but the community core should accept the matrix-wide set.

## Media Strategy

Images are allowed in V1 because sharing without images will feel weak, especially for Magicoord.

Cost and moderation controls:

- Logged-in users only.
- Max 4 images per post.
- Max 1 image per reply in V1, or replies can start text-only if needed.
- Max original upload size: 5 MB.
- Store optimized display image around 1600 px max edge.
- Store thumbnail around 480 px max edge.
- Prefer WebP or JPEG output.
- Daily user upload limit.
- Per-IP upload rate limit.
- Media can be hidden independently from post text.

Storage candidates:

- Supabase Storage for fastest integration.
- Cloudflare R2 later if storage/bandwidth cost becomes important.

V1 can start with Supabase Storage and keep paths portable.

## Proposed Database

Schema can be `public` or a dedicated `community` schema. A dedicated `community` schema is cleaner, but public tables are easier for existing Supabase tooling. Recommendation: use `public` tables with `community_` prefix for V1.

### community_boards

- `id uuid primary key`
- `slug text unique not null`
- `product_code text null`
- `title jsonb not null`
- `description jsonb null`
- `visibility text not null default 'public'`
- `sort_order int not null default 100`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Visibility values:

- `public`
- `logged_in`
- `admin_only`
- `paused`

### community_posts

- `id uuid primary key`
- `board_id uuid not null`
- `user_id uuid not null`
- `product_code text null`
- `post_type text not null default 'discussion'`
- `title text not null`
- `body text not null`
- `language_code text not null default 'unknown'`
- `status text not null default 'published'`
- `reply_count int not null default 0`
- `reaction_count int not null default 0`
- `last_activity_at timestamptz not null default now()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Status values:

- `published`
- `hidden`
- `deleted`
- `pending_review`

Post type examples:

- `discussion`
- `feedback`
- `outfit_share`
- `learning_share`
- `question`

### community_replies

- `id uuid primary key`
- `post_id uuid not null`
- `user_id uuid not null`
- `body text not null`
- `language_code text not null default 'unknown'`
- `status text not null default 'published'`
- `reaction_count int not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### community_media

- `id uuid primary key`
- `owner_user_id uuid not null`
- `post_id uuid null`
- `reply_id uuid null`
- `storage_bucket text not null`
- `storage_path text not null`
- `thumbnail_path text null`
- `mime_type text not null`
- `width int null`
- `height int null`
- `size_bytes int not null`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`

Status values:

- `active`
- `hidden`
- `deleted`
- `pending_review`

### community_reactions

- `id uuid primary key`
- `user_id uuid not null`
- `target_type text not null`
- `target_id uuid not null`
- `reaction_type text not null default 'like'`
- `created_at timestamptz not null default now()`

Add a unique constraint on `(user_id, target_type, target_id, reaction_type)`.

### community_reports

- `id uuid primary key`
- `reporter_user_id uuid not null`
- `target_type text not null`
- `target_id uuid not null`
- `reason text not null`
- `details text null`
- `status text not null default 'open'`
- `reviewed_by uuid null`
- `reviewed_at timestamptz null`
- `created_at timestamptz not null default now()`

Status values:

- `open`
- `reviewing`
- `accepted`
- `rejected`
- `resolved`

### community_moderation_actions

- `id uuid primary key`
- `moderator_user_id uuid not null`
- `target_type text not null`
- `target_id uuid not null`
- `action text not null`
- `reason text null`
- `created_at timestamptz not null default now()`

## RLS And Access Rules

Read:

- Public boards and published posts can be read by visitors if we want public SEO/community visibility.
- Logged-in-only boards require session.
- Paused/admin-only boards are not visible to normal users.

Write:

- Only logged-in users can create posts, replies, reactions, reports, and media.
- Users can edit/delete their own published content within policy.
- Admin can moderate all content.

Protection:

- Rate limit create post, reply, report, reaction, and upload endpoints.
- Do not expose service role to clients.
- All write operations go through Dashboard API routes or RPCs.
- Validate board visibility and product status server-side.

## API Surface

User API:

- `GET /api/community/boards`
- `GET /api/community/posts?board=&language=&page=`
- `POST /api/community/posts`
- `GET /api/community/posts/[postId]`
- `POST /api/community/posts/[postId]/replies`
- `POST /api/community/reactions`
- `DELETE /api/community/reactions`
- `POST /api/community/reports`
- `POST /api/community/media/upload`

Admin API:

- `GET /api/admin/community/posts`
- `PATCH /api/admin/community/posts/[postId]`
- `GET /api/admin/community/reports`
- `PATCH /api/admin/community/reports/[reportId]`
- `PATCH /api/admin/community/media/[mediaId]`

## UI Placement

Dashboard:

- Full community experience for logged-in users.
- `/dashboard/community`
- `/dashboard/community/[boardSlug]`
- `/dashboard/community/posts/[postId]`

Main site:

- V1 can show a simple Community entry page.
- Later can show featured posts.

Admin:

- `/dashboard/admin/community`
- `/dashboard/admin/community/reports`

App integration:

- App cards can link to their board.
- Later each App can embed a board-specific feed.

## iOS Compatibility

iOS apps can use the same API later.

Rules:

- Community can be shown inside app UI.
- Must provide report/block or moderation flow when UGC is enabled.
- No external purchase CTAs in community content or official UI.
- Paid boosts/promoted content should not be part of V1.

## Cost Controls

V1 limits:

- Max 4 post images.
- Max 5 MB original upload.
- Daily upload cap per user.
- Daily post/reply cap per user.
- Per-IP write rate limits.
- Hidden/deleted media should stop rendering.
- Admin can quickly hide abusive content.

Monitoring:

- Storage bytes by user.
- Upload count by user/day.
- Reports by board.
- Most active users.
- Failed write/rate-limit events.

## Implementation Phases

### Phase 0: Design Lock

- Confirm V1 scope.
- Confirm whether public visitors can read posts.
- Confirm image storage provider.
- Confirm first boards and visibility.

### Phase 1: Database And Storage

- Add community tables.
- Add indexes and constraints.
- Add RLS.
- Add seed boards.
- Create storage bucket and upload policy.

### Phase 2: User API

- Boards API.
- Posts list/detail API.
- Create post/reply API.
- Reaction/report API.
- Media upload API with limits.

### Phase 3: User UI

- Community home.
- Board page.
- Post detail.
- Create post form.
- Reply form.
- Image upload UI.
- Language filter.

### Phase 4: Admin Moderation

- Admin post/reply/media table.
- Report queue.
- Hide/restore actions.
- Basic moderation audit log.

### Phase 5: Polish And Launch

- Multilingual UI copy.
- Empty/loading/error states.
- Mobile layout.
- Smoke tests.
- Security/rate-limit review.
- Public launch note.

## Open Decisions

1. Should visitors be able to read published community posts?
2. Should replies allow images in V1, or should images be post-only first?
3. Should Magicoord board be visible while Magicoord public app entry is paused?
4. Should users be able to edit posts, or only delete/hide and repost in V1?
5. Should user display name come from `public.users.full_name`, or add community-specific nickname later?

## Recommended V1 Defaults

- Visitors can read public boards.
- Only logged-in users can write.
- Images allowed for posts only in V1.
- Replies are text-only in V1.
- Magicoord board starts `logged_in` or `paused` until product entry is reopened.
- Users can edit within a short window, such as 30 minutes.
- Admin can always hide/restore.
- Current UI language is prioritized, with filters for all/specific language.

