#!/bin/bash
# runs test suites in parallel (logs in dist/logs). Usage: tests/run.sh [quick|full|names...]
# the bot suites are slow; run them a few at a time (full can take 15+ min)
cd "$(dirname "$0")/.." && mkdir -p dist/logs dist/shots
QUICK="fingerprint screens registry smoke ux qa_edge b2_test coach_test bk_test dist_test"
FULL="$QUICK qa_new qa_nw qa_st qa_rh qa_wz qa_sport qa_arc qa_ft qa_ch qa_pz2 pz_t2 vh_bot plane_bot b2_dist qa_b3 gi_test bk_t2"
case "$1" in ''|quick) T=$QUICK;; full) T=$FULL;; *) T="$@";; esac
for t in $T; do (timeout 900 node tests/$t.js > dist/logs/$t.log 2>&1; echo "exit $?" >> dist/logs/$t.log) & 
  while [ $(jobs -r | wc -l) -ge 6 ]; do sleep 1; done; done; wait
for t in $T; do echo "== $t: $(tail -c 400 dist/logs/$t.log | tr '\n' ' ' | cut -c1-260)"; done
