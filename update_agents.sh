#!/bin/bash

awk '
/## 16. Version History/ {
  print "## 16. Verification & Anti-Assumption (The Golden Rule)"
  print ""
  print "The AI Implementor must **never assume** the success of an action, the state of the repository, or the existence of files/directories. Verify anything that you report to the user."
  print "- **Execute and Probe:** Every action'"'"'s effect must be explicitly verified to check if it was successful or not."
  print "- **Fact-Check Prose:** Verify any prose with the truth of the repo and what is actually implemented by probing and executing (e.g., creating a work tree, executing probes)."
  print "- **No Assumptions:** Never assume. Verify is the golden rule."
  print ""
  print "## 17. Version History"
  print ""
  print "**AGENTS.md**"
  print "Version 1.6.0"
  print ""
  print "*   **Change History:**"
  print "    *   **v1.6.0:** Added Rule 16 (Verification & Anti-Assumption - The Golden Rule) to enforce strict execution verification and anti-assumption protocols."
  next
}
/Version 1.5.1/ {
  next
}
/\*   \*\*Change History:\*\*/ {
  next
}
{ print }
' AGENTS.md > AGENTS_new.md

mv AGENTS_new.md AGENTS.md
