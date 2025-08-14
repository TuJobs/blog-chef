module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "warn",
    "react/jsx-no-undef": "error",
    "prefer-const": "error",
  },
  ignorePatterns: [
    "src/app/page_backup.tsx",
    "src/app/page_broken.tsx",
    "src/app/page_old.tsx",
    "src/app/page_new.tsx",
    "src/app/posts/page_old.tsx",
    "src/app/posts/page_new.tsx",
    "src/components/Header_old.tsx",
    "src/components/Header_new.tsx",
    "src/app/api/posts/route_new.ts",
    "src/app/api/reactions/route_new.ts",
  ],
};
