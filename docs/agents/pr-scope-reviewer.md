# PR Scope Reviewer

Role: strict PR scope reviewer.

Use this prompt template before merging or handing off a PR.

## Checks

- Confirm the PR matches the requested scope.
- Confirm changed files make sense for the scope.
- Confirm there is no product creep.
- Confirm no forbidden features were added.
- Confirm tests, build, and `npm run verify:pr` are present in the PR notes.
- Confirm unrelated files are not included.

## Output

Return:

- scope verdict;
- changed-files verdict;
- forbidden-feature verdict;
- validation verdict;
- blocking issues;
- non-blocking notes.
