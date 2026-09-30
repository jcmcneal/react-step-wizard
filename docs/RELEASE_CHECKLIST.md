# Review and release checklist

Candidate: 6.0.0-beta.0. Nothing has been published from this branch.

## Before approval

- Review API, migration guide, README, and every row in RESOLUTION_MAP.md.
- Review React18 minimum, UMD/private import retirement, explicit CSS, removed
  class internals and Promise navigation. Choose the final version/dist-tag.
- Read VALIDATION.md and CI results for the exact final commit.
- Confirm #93/#127 with reporter applications if available; review #41 on touch devices.
- Review production example in actual Chrome/Edge/Firefox/Safari. Automated WebKit
  coverage is not the same as Safari application testing. Check reduced motion,
  focus management, validation, deep links and custom animation durations.
- Check `npm pack --dry-run` contents and npm audit from the locked toolchain.
- Acknowledge feature PR contributors. Prepare individual closure explanations,
  distinguishing incorporated work, superseded patches, answered usage questions,
  and reports still requiring evidence. Do not blanket-close all items.

## After separate maintainer authorization

1. Merge the reviewed implementation through the normal repository workflow.
2. Choose an immutable release tag matching package.json and reviewed commit.
3. Confirm npm ownership/access and registry protections without creating persistent
   credentials. The workflow uses an existing npm secret only if configured.
4. Configure the `npm-release` GitHub environment with required reviewers before
   dispatching the manual publish workflow. A named environment alone does not
   establish an approval gate.
5. Dispatch the publish workflow with the reviewed tag and correct npm dist-tag.
   Prerelease versions must use a non-latest dist-tag. Verify registry exports and
   installs after publication. Publish GitHub release notes separately if approved.
6. Post per-item evidence and close only issues/PRs whose disposition has been
   accepted. Preserve unanswered reporter verification/feature decisions.

This checklist is preparation, not authorization to merge, publish or close items.
