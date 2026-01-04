# Bun Patching Guide

This guide explains how to patch node_modules packages using Bun's built-in patching system.

## When to Use Patching

Use patching when you need to:
- Fix a bug in a dependency before an official fix is released
- Remove unwanted behavior (like annoying errors/warnings)
- Add small modifications to library behavior

## Patching Procedure

### Step 1: Start Patch Mode

```bash
bun patch <package-name>
```

**Example:**
```bash
bun patch @tiptap/react
```

This tells Bun you want to patch this package. You'll see output like:

```
To patch @tiptap/react, edit the following folder:

  node_modules/@tiptap/react

Once you're done with your changes, run:

  bun patch --commit 'node_modules/@tiptap/react'
```

### Step 2: Edit the Package Files

Navigate to `node_modules/<package-name>` and make your changes directly to the files.

**Tips:**
- For JavaScript packages, you usually need to edit files in `dist/` folder
- Edit both `.js` and `.cjs` files if both exist
- Keep changes minimal and focused

**Example:** To change a `throw new Error()` to `console.warn()`:
```javascript
// Before
throw new Error("Some error message");

// After
console.warn("Some warning message");
```

### Step 3: Commit the Patch

```bash
bun patch --commit 'node_modules/<package-name>'
```

**Example:**
```bash
bun patch --commit 'node_modules/@tiptap/react'
```

This will:
1. Generate a `.patch` file in the `patches/` directory
2. Automatically add `patchedDependencies` to your `package.json`

### Step 4: Verify

After committing, you should see:

**New patch file:**
```
patches/@<scope>%2F<package>@<version>.patch
```
Example: `patches/@tiptap%2Freact@3.14.0.patch`

**Updated `package.json`:**
```json
{
  "patchedDependencies": {
    "@tiptap/react@3.14.0": "patches/@tiptap%2Freact@3.14.0.patch"
  }
}
```

## After Patching

### Commit to Git

Make sure to commit both files to your repository:
```bash
git add patches/ package.json
git commit -m "Patch @tiptap/react to convert SSR error to warning"
```

### Future Installs

The patch is automatically applied whenever you or your teammates run:
```bash
bun install
```

## Removing a Patch

1. Delete the patch file from `patches/`
2. Remove the entry from `patchedDependencies` in `package.json`
3. Run `bun install` to reinstall the original package

## Updating a Patched Package

When updating a patched package to a new version:

1. Remove the old patch (see above)
2. Update the package: `bun update <package-name>`
3. Check if the patch is still needed
4. If needed, create a new patch following the procedure above

> **Note:** The patch is version-specific. If you update `@tiptap/react` from `3.14.0` to `3.15.0`, you'll need to create a new patch for `3.15.0`.

## Current Patches in This Project

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | 3.14.0 | Converts SSR error to warning when using `immediatelyRender: true` |

## References

- [Bun Documentation - Patching](https://bun.sh/docs/install/patch)
