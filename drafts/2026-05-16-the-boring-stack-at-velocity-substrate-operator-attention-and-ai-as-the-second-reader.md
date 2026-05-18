---
title: "The Boring Stack at Velocity: Substrate, Operator Attention, and AI as the Second Reader"
date: 2026-05-16
formattedDate: "May 16, 2026"
categories: ["Technology"]
---

A week ago I walked along Ocean Beach with my old colleague Bilal. By the end of the walk we'd named the credentialing problem he runs into with his butterfly conservatories in Pakistan, the one Liz at Aora hits with kids learning agroforestry, the one Stanley Li sees with SFSU students — the same gap, three independent contexts, no coordination between them. By the following day I had a design doc. Within a week, the credentialing platform was live on truesight.me, the first practitioner-DAO merge had shipped, 377 contributor profile pages were online, and Bilal had a working URL to forward to his team.

Ocean Beach to live-on-prod in seven days. That arc would have been impossible at the company I worked at before, and is probably impossible at the company you work at now — not because the engineers were less capable, but because the *substrate* was too thick. Every decision had to route through three layers of orchestration, two PMs, a quarterly planning cycle, and a CI/CD pipeline that wanted its tribute.

The arc was possible at TrueSight because the substrate is almost embarrassingly thin. I'd like to share what that thinness has come to mean, now that I've watched it work for five years.

## The shape of the stack

The whole backend is the kind of thing you can describe in one sentence: TrueSight runs on Google Sheets and some Apps Script. The contributions ledger is a spreadsheet. The static sites publish from GitHub Pages. Edgar is a single Rails app deployed via `./deploy.sh`. A small Apps Script webhook processes events from Telegram into the ledger. That's it.

For years I'd describe this and watch people pattern-match on it as a prototype that hadn't outgrown itself. The misread is real but I've stopped worrying about it, because the misread costs less every year and the substrate's advantages compound monthly. The people whose opinion ends up mattering — partners running physical-world programs, contributors who've stuck around through the quiet stretches, and increasingly AI assistants doing real work in the codebase — none of them filter on the stack. They filter on whether the receipts are real and whether the system actually works at 9pm when something needs to ship.

## The velocity numbers

I just looked at the activity logs in our documentation repo. 202 commits in the last fourteen days, on the docs repo alone — not the product repo.

The number isn't the impressive part. The impressive part is how concrete the arcs are. A sample from the last two weeks:

- A pattern surfaced: contributors needed to record external purchases (someone bought a coffee maker for office use, that money needed to land on the ledger). Same day, I shipped end-to-end — a new CLI command in the Python client, a new event handler in the Rails app, a new Apps Script processor, an audit table, the first real receipt processed live. Four repositories. One day.
- A pattern surfaced: managed-ledger transparency dashboards. I wrote a spec, built the snapshot pipeline, and shipped the first explorer for the Tribo Bahia Mirim capoeira donations ledger. Design doc to live URL: forty-eight hours.
- The credentialing arc described above: Ocean Beach walk to live-on-prod, including a Grok-narrative generator, a day-anchored I Ching reading on the oracle, and 377 contributor CVs auto-published. Seven days.

These aren't sprints I'm pointing at to flex. They're arcs I'm pointing at because they would not be possible on a thicker substrate. The gap between "pattern surfaced" and "implementation shipped" is bounded by how fast one operator can type. There is no orchestration layer absorbing the slack.

## The pareto filter is operator attention

A reasonable objection: "OK so the stack lets you ship fast, but how do you decide what to ship?" In a normal company this is the bottleneck. The product manager argues with engineering about priorities. The CEO overrides. The roadmap gets re-shuffled every quarter.

TrueSight has no product manager. The pareto filter that picks what to ship next isn't a collective vote — it's my own attention, allocated against everything the DAO is doing. The DAO is small enough that I am the filter. Signal flows through me — partner visits, contributor conversations, Telegram threads, governor reviews, my own discriminative judgment — and the thing that wins attention gets built that week.

This is the part of the architecture that doesn't generalize. The boring stack scales fine; you can keep adding spreadsheets and Apps Scripts forever. The operator-attention layer doesn't. At some level of contributor density it stops being possible for one person to hold the coherent world model that makes hours-to-implementation work.

The work I've been quietly doing to prepare for that crossing is the part of the architecture I'm most uncertain about. Git worktree isolation when multiple AI agents work in the same repository. An autonomous agent that opens its own pull requests with its own RSA keypair. A permissions matrix on the DApp so multiple governors can hold edit rights without stepping on each other. These are primitives for *multiplexing the operator-attention layer*, not for scaling the stack. The stack doesn't need help.

## AI as the second reader

Here's the argument that's hardest to make to a 2022 audience and easiest to make to a 2026 one: AI assistants reason about boring stacks far better than they reason about clever ones.

Every assistant I use to ship at TrueSight — Claude, Codex, the autopilot — performs an order of magnitude better in a thin Apps-Script-and-Sheets environment than it would in a typed-DSL-over-Kubernetes one. The reasons are operational, not aesthetic. The whole reasoning surface fits in context. The failure modes are legible: the cell contains the wrong value; the script log shows the wrong line. There's no orchestration magic between intent and execution. When I describe a feature in plain English, the assistant can map it to specific cells, specific Apps Script functions, specific GitHub Actions — and ship the change as a pull request the same hour.

This advantage compounds monthly. The thicker the substrate, the more an AI assistant has to model before it can do useful work. The thinner the substrate, the more directly the assistant can act. The velocity numbers I quoted above are direct evidence — those arcs aren't possible without AI as a primary collaborator, and AI as a primary collaborator isn't possible at that velocity without a substrate it can reason about end-to-end.

The framing I've come to use is that AI is now the *second reader* of the codebase, after the operator. The first reader is the human typing the change; the second is the assistant called in to make the next change. Optimizing for the second reader as a first-class concern changes what good architecture looks like. The thing that makes a stack legible to a junior engineer is increasingly the thing that makes it productive for an AI assistant. They are converging.

## What the substrate stops being good at

The boring stack has a real limit, and I want to name it before someone else does for me: it doesn't carry institutional weight. Universities, NGOs, governments evaluating a partnership default to "is this legible to our IT review?" and a Google Sheet doesn't pass that bar, regardless of substance. There are conversations I don't get to have because the substrate filters those conversations out before they start.

I've made my peace with that. The conversations I *do* get to have are the ones where someone has already looked past the substrate to what's being built. Those conversations are the only ones I'd want anyway, and they happen to be the ones that produce the partnerships that actually ship — Bilal in Pakistan, Liz at Aora, the kids in Itacaré, the contributors who've been around for five years. The substrate is doing a filtering job, and the people who pass through the filter are the ones I'd self-select for.

## The forward question

The trade keeps getting better. "Embarrassingly thin substrate, hours-to-implementation velocity" turns out to be a strong position once AI assistants become the primary collaborator and the bottleneck moves from infrastructure to operator attention. The stack doesn't need to scale; the attention layer does, and that's a different kind of engineering work.

What I keep wondering is whether you, reading this, are in a similar trade. The surface signals you're optimizing for — the framework choice, the language flex, the deployment topology — signal something to the room you're in right now. Are they signaling the right thing to the room you'll be in five years from now? When AI assistants are the second-most-important consumer of your codebase, will your stack let them reason about it end-to-end? When a pattern surfaces in a conversation on a Tuesday, can you ship the implementation by Wednesday?

Set up the field, conserve the energy, wait for the right phase transition. The substrate is supposed to disappear under the work, not be the work.

- Technology
- DAO
- TrueSight
- AI
- Operator
