# Web Artifacts Builder Skill Dependencies

## Requirements
- **Node.js 18+** (for React/Vite/Parcel)
- **Bash shell** (scripts are .sh files)
- **npm** for package management

## How it works
This is a project scaffolding skill, not a single-command test.

1. `scripts/init-artifact.sh <name>` - Creates new React + TypeScript + Tailwind project
2. `scripts/bundle-artifact.sh` - Bundles project into single HTML artifact

## Stack Created
- React 18 + TypeScript + Vite
- Tailwind CSS 3.4.1
- shadcn/ui components (40+ pre-installed)
- Parcel for bundling

## Notes
- Scripts are bash-based (may need Git Bash or WSL on Windows)
- Creates self-contained HTML artifacts for Claude.ai
- Includes `shadcn-components.tar.gz` with pre-configured components
