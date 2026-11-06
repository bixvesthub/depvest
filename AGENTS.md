<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture

- DepVest is a single-route dashboard; accounts, profiles, preferences and linked wallets persist in Lovable Cloud (`profiles`, `wallet_links`, RLS own-row only) via `src/lib/account.ts`, while balances, ledger, tasks and referrals remain local React state until their backend phase — keeps persistence rolled out incrementally.
