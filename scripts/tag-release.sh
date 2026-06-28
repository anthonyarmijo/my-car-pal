#!/bin/bash
# Tag a release and push. Usage: ./scripts/tag-release.sh v1.0.0
set -euo pipefail

VERSION="${1:?Usage: $0 <version>}"

git tag -a "$VERSION" -m "Release $VERSION"
git push origin "$VERSION"

# Optionally create GitHub release (requires gh CLI):
if command -v gh &>/dev/null; then
  gh release create "$VERSION" --title "$VERSION" --generate-notes
fi
