# Starter problem set

> **Spoilers:** this file lists the intended technique for every problem. It's for authors, not players.

Picked from the research bank (*Competitive programming problem bank.md*). DP has 10 per tier and two extra layers per problem (**state** and **transition**); every other subject has 5 per tier. All files start as `status: "draft"` with an empty `summary` — write the summary in your own words, re-check `constraints` on the judge page, then set `status` to `"ready"`.

| Subject | Easy | Medium | Hard | Total |
|---|---|---|---|---|
| Dynamic Programming | 10 | 10 | 10 | 30 |
| Graphs | 5 | 5 | 5 | 15 |
| Computational Geometry | 5 | 5 | 5 | 15 |
| Number Theory | 5 | 5 | 5 | 15 |
| Binary Search / Divide & Conquer | 5 | 5 | 5 | 15 |
| Segment Tree / Range Queries | 5 | 5 | 5 | 15 |
| None of these (greedy / ad hoc) | 2 | 0 | 0 | 2 |
| **All** | | | | **107** |

## Dynamic Programming

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Frog 1](https://atcoder.jp/contests/dp/tasks/dp_a) `atcoder-dp-a` | E (estimate) | Linear / 1D DP | — | **no** | dp-state, dp-transition | — |
| [Vacation](https://atcoder.jp/contests/dp/tasks/dp_c) `atcoder-dp-c` | E (estimate) | Linear / 1D DP | — | **no** | dp-state, dp-transition | — |
| [Dice Combinations](https://cses.fi/problemset/task/1633) `cses-1633` | E (estimate) | Linear / 1D DP | Coin change (unbounded, min or count) (accepted) | **no** | dp-state, dp-transition | cses-1096 |
| [Minimizing Coins](https://cses.fi/problemset/task/1634) `cses-1634` | E (estimate) | Coin change (unbounded, min or count) | — | yes | dp-state, dp-transition | cf-996a |
| [Coin Combinations I](https://cses.fi/problemset/task/1635) `cses-1635` | E (estimate) | Coin change (unbounded, min or count) | — | **no** | dp-state, dp-transition | cses-1636 |
| [Coin Combinations II](https://cses.fi/problemset/task/1636) `cses-1636` | E (estimate) | Coin change (unbounded, min or count) | — | yes | dp-state, dp-transition | cses-1635 |
| [Grid Paths](https://cses.fi/problemset/task/1638) `cses-1638` | E (estimate) | Grid / 2D DP | — | yes | dp-state, dp-transition | — |
| [Book Shop](https://cses.fi/problemset/task/1158) `cses-1158` | E (estimate) | 0/1 knapsack | — | yes | dp-state, dp-transition | atcoder-dp-e |
| [Longest Path](https://atcoder.jp/contests/dp/tasks/dp_g) `atcoder-dp-g` | E (estimate) | DP on a DAG (topological order) | Topological sort (accepted) | yes | dp-state, dp-transition | — |
| [Array Description](https://cses.fi/problemset/task/1746) `cses-1746` | E/M (estimate) | Linear / 1D DP | — | **no** | dp-state, dp-transition | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Knapsack 2](https://atcoder.jp/contests/dp/tasks/dp_e) `atcoder-dp-e` | M (estimate) | 0/1 knapsack | — | yes | dp-state, dp-transition | cses-1158 |
| [Edit Distance](https://cses.fi/problemset/task/1639) `cses-1639` | E/M (estimate) | Two sequences (LCS / edit distance) | — | yes | dp-state, dp-transition | — |
| [Increasing Subsequence](https://cses.fi/problemset/task/1145) `cses-1145` | E/M (estimate) | Longest increasing subsequence | — | yes | dp-state, dp-transition | — |
| [Removal Game](https://cses.fi/problemset/task/1097) `cses-1097` | E/M (estimate) | Interval DP (dp[l][r]) | — | yes | dp-state, dp-transition | — |
| [Independent Set](https://atcoder.jp/contests/dp/tasks/dp_p) `atcoder-dp-p` | E/M (estimate) | DP on trees | — | yes | dp-state, dp-transition | — |
| [Boredom](https://codeforces.com/problemset/problem/455/A) `cf-455a` | 1500 | Linear / 1D DP | — | yes | dp-state, dp-transition | — |
| [Sleeping Schedule](https://codeforces.com/problemset/problem/1324/E) `cf-1324e` | 1700 | Linear / 1D DP | — | yes | dp-state, dp-transition | — |
| [Throwing Dice](https://cses.fi/problemset/task/1096) `cses-1096` | M (estimate) | Matrix exponentiation of a recurrence | — | yes | dp-state, dp-transition | cses-1633 |
| [Counting Numbers](https://cses.fi/problemset/task/2220) `cses-2220` | M (estimate) | Digit DP | — | yes | dp-state, dp-transition | — |
| [Matching](https://atcoder.jp/contests/dp/tasks/dp_o) `atcoder-dp-o` | M (estimate) | Bitmask DP (n·2^n) | — | yes | dp-state, dp-transition | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Clear the String](https://codeforces.com/problemset/problem/1132/F) `cf-1132f` | 2000 | Interval DP (dp[l][r]) | — | yes | dp-state, dp-transition | — |
| [Sushi](https://atcoder.jp/contests/dp/tasks/dp_j) `atcoder-dp-j` | M/H (estimate) | Probability / expected-value DP | — | yes | dp-state, dp-transition | — |
| [Grouping](https://atcoder.jp/contests/dp/tasks/dp_u) `atcoder-dp-u` | M/H (estimate) | Submask enumeration (3^n) | Bitmask DP (n·2^n) (accepted) | yes | dp-state, dp-transition | — |
| [Subtree](https://atcoder.jp/contests/dp/tasks/dp_v) `atcoder-dp-v` | H (estimate) | Rerooting (answer for every root) | DP on trees (accepted) | yes | dp-state, dp-transition | — |
| [Counting Tilings](https://cses.fi/problemset/task/2181) `cses-2181` | H (estimate) | Profile / broken-profile DP | Bitmask DP (n·2^n) (accepted) | yes | dp-state, dp-transition | — |
| [Frog 3](https://atcoder.jp/contests/dp/tasks/dp_z) `atcoder-dp-z` | H (estimate) | Optimization: convex hull trick | — | yes | dp-state, dp-transition | atcoder-dp-a |
| [Pictures with Kittens (hard version)](https://codeforces.com/problemset/problem/1077/F2) `cf-1077f2` | 2100 | Optimization: monotonic deque | — | yes | dp-state, dp-transition | — |
| [Grid 2](https://atcoder.jp/contests/dp/tasks/dp_y) `atcoder-dp-y` | M/H (estimate) | DP over sorted special points (+ combinatorics) | Binomials mod p (factorials + inverses) (accepted) | yes | dp-state, dp-transition | — |
| [Elevator Rides](https://cses.fi/problemset/task/1653) `cses-1653` | M (estimate) | Bitmask DP (n·2^n) | — | yes | dp-state, dp-transition | — |
| [Subarray Squares](https://cses.fi/problemset/task/2086) `cses-2086` | M/H (estimate) | Optimization: divide & conquer DP | Optimization: convex hull trick (accepted) | yes | dp-state, dp-transition | — |

## Graphs

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Message Route](https://cses.fi/problemset/task/1667) `cses-1667` | E (estimate) | BFS (unweighted shortest path) | — | **no** | — | — |
| [Building Teams](https://cses.fi/problemset/task/1668) `cses-1668` | E (estimate) | Bipartite check (2-colouring) | — | **no** | — | — |
| [Shortest Routes I](https://cses.fi/problemset/task/1671) `cses-1671` | E (usaco) | Dijkstra | — | yes | — | cses-1672 |
| [Shortest Routes II](https://cses.fi/problemset/task/1672) `cses-1672` | E (usaco) | Floyd-Warshall (all pairs) | — | yes | — | cses-1671 |
| [Road Reparation](https://cses.fi/problemset/task/1675) `cses-1675` | E (estimate) | Minimum spanning tree (Kruskal / Prim) | — | yes | — | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Monsters](https://cses.fi/problemset/task/1194) `cses-1194` | M (estimate) | Multi-source BFS | — | yes | — | — |
| [High Score](https://cses.fi/problemset/task/1673) `cses-1673` | M (estimate) | Bellman-Ford (negative edges / cycles) | — | yes | — | — |
| [Fox And Names](https://codeforces.com/problemset/problem/510/C) `cf-510c` | 1600 | Topological sort | — | yes | — | — |
| [Necessary Roads](https://cses.fi/problemset/task/2076) `cses-2076` | M (estimate) | Bridges / articulation points | — | yes | — | — |
| [Labyrinth](https://codeforces.com/problemset/problem/1063/B) `cf-1063b` | 1800 | 0-1 BFS | — | yes | — | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Olya and Energy Drinks](https://codeforces.com/problemset/problem/877/D) `cf-877d` | 2100 | BFS (unweighted shortest path) | — | yes | — | — |
| [Giant Pizza](https://cses.fi/problemset/task/1684) `cses-1684` | M/H (estimate) | 2-SAT | — | yes | — | — |
| [We Need More Bosses](https://codeforces.com/problemset/problem/1000/E) `cf-1000e` | 2100 | Bridges / articulation points | Tree diameter / centers (accepted) | yes | — | — |
| [Make It Connected](https://codeforces.com/problemset/problem/1095/F) `cf-1095f` | 1900 | Minimum spanning tree (Kruskal / Prim) | — | yes | — | — |
| [Download Speed](https://cses.fi/problemset/task/1694) `cses-1694` | M (estimate) | Max flow / min cut | — | yes | — | — |

## Computational Geometry

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Point Location Test](https://cses.fi/problemset/task/2189) `cses-2189` | E (usaco) | Cross product / orientation test | — | yes | — | — |
| [Polygon Area](https://open.kattis.com/problems/polygonarea) `kattis-polygonarea` | 1.8 (kattis) | Shoelace area / Pick's theorem | — | yes | — | — |
| [Convex Hull](https://open.kattis.com/problems/convexhull) `kattis-convexhull` | 2.3 (kattis) | Convex hull | — | yes | — | cses-2195 |
| [Point in Polygon](https://open.kattis.com/problems/pointinpolygon) `kattis-pointinpolygon` | 3.6 (kattis) | Point in polygon (ray casting / winding) | — | yes | — | — |
| [Dist Max](https://atcoder.jp/contests/abc178/tasks/abc178_e) `atcoder-abc178-e` | E (estimate) | Manhattan distance via 45° rotation | — | yes | — | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Line Segment Intersection](https://cses.fi/problemset/task/2190) `cses-2190` | M (usaco) | Segment intersection | — | yes | — | — |
| [Polygon Lattice Points](https://cses.fi/problemset/task/2193) `cses-2193` | M (estimate) | Shoelace area / Pick's theorem | GCD / LCM (accepted) | yes | — | — |
| [Convex Hull](https://cses.fi/problemset/task/2195) `cses-2195` | M (estimate) | Convex hull | — | yes | — | kattis-convexhull |
| [Minimum Euclidean Distance](https://cses.fi/problemset/task/2194) `cses-2194` | M (estimate) | Closest pair of points | Classic divide & conquer (accepted) | yes | — | — |
| [Robert Hood](https://open.kattis.com/problems/roberthood) `kattis-roberthood` | 3.0 (kattis) | Rotating calipers | Convex hull (accepted) | yes | — | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Polygons](https://codeforces.com/problemset/problem/166/B) `cf-166b` | 2100 | Point in convex polygon, O(log n) | — | yes | — | — |
| [Area of Rectangles](https://cses.fi/problemset/task/1741) `cses-1741` | M/H (estimate) | Line sweep | Lazy propagation (range update, range query) (accepted) | yes | — | — |
| [Nearest vectors](https://codeforces.com/problemset/problem/598/C) `cf-598c` | 2300 | Angular / polar sort | — | yes | — | — |
| [Nature Reserve](https://codeforces.com/problemset/problem/1059/D) `cf-1059d` | 2200 | Circles (intersection, enclosing circle) | Binary search on real numbers (accepted) | yes | — | — |
| [U2](https://codeforces.com/problemset/problem/1142/C) `cf-1142c` | 2400 | Convex hull | — | yes | — | — |

## Number Theory

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Almost Prime](https://codeforces.com/contest/26/problem/A) `cf-26a` | 900 | Sieve of Eratosthenes | — | yes | — | — |
| [Exponentiation](https://cses.fi/problemset/task/1095) `cses-1095` | E (estimate) | Binary (fast) exponentiation | — | yes | — | cses-1712 |
| [Binomial Coefficients](https://cses.fi/problemset/task/1079) `cses-1079` | E (estimate) | Binomials mod p (factorials + inverses) | Modular inverse (accepted) | yes | — | — |
| [Counting Divisors](https://cses.fi/problemset/task/1713) `cses-1713` | E (estimate) | Divisor count / sum | Harmonic loop over multiples (n log n) (accepted); Smallest-prime-factor / linear sieve (accepted) | yes | — | — |
| [Product of Three Numbers](https://codeforces.com/problemset/problem/1294/C) `cf-1294c` | 1300 | Trial division up to √n | — | yes | — | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Exponentiation II](https://cses.fi/problemset/task/1712) `cses-1712` | E/M (estimate) | Binary (fast) exponentiation | — | yes | — | cses-1095 |
| [Prime Multiples](https://cses.fi/problemset/task/2185) `cses-2185` | M (estimate) | Inclusion–exclusion | — | yes | — | — |
| [Same GCDs](https://codeforces.com/problemset/problem/1295/D) `cf-1295d` | 1800 | Euler's totient | — | yes | — | — |
| [Line](https://codeforces.com/problemset/problem/7/C) `cf-7c` | 1800 | Extended Euclid / linear Diophantine | — | yes | — | — |
| [Common Divisors](https://cses.fi/problemset/task/1081) `cses-1081` | M (usaco) | Harmonic loop over multiples (n log n) | — | yes | — | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Two Divisors](https://codeforces.com/problemset/problem/1366/D) `cf-1366d` | 2000 | Smallest-prime-factor / linear sieve | GCD / LCM (accepted) | yes | — | — |
| [Sum of Divisors](https://cses.fi/problemset/task/1082) `cses-1082` | H (usaco) | floor(n/i) blocks, O(√n) | — | yes | — | — |
| [Counting Coprime Pairs](https://cses.fi/problemset/task/2417) `cses-2417` | M/H (estimate) | Möbius function | Harmonic loop over multiples (n log n) (accepted) | yes | — | — |
| [Prime or Not](https://www.spoj.com/problems/PON/) `spoj-pon` | M/H (estimate) | Miller–Rabin primality | — | yes | — | — |
| [Divisors](https://codeforces.com/problemset/problem/1033/D) `cf-1033d` | 2000 | GCD / LCM | Pollard's rho factorization (overkill) | yes | — | — |

## Binary Search / Divide & Conquer

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Interesting drink](https://codeforces.com/problemset/problem/706/B) `cf-706b` | 1100 | Binary search on a sorted array (lower/upper bound) | — | yes | — | — |
| [Factory Machines](https://cses.fi/problemset/task/1620) `cses-1620` | E (usaco) | Binary search on the answer | — | yes | — | — |
| [Array Division](https://cses.fi/problemset/task/1085) `cses-1085` | E (usaco) | Binary search on the answer | — | yes | — | — |
| [Meet in the Middle](https://cses.fi/problemset/task/1628) `cses-1628` | E (usaco) | Meet in the middle | — | yes | — | — |
| [Books](https://codeforces.com/problemset/problem/279/B) `cf-279b` | 1400 | Two pointers / sliding window | Binary search on a sorted array (lower/upper bound) (accepted) | **no** | — | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [The Meeting Place Cannot Be Changed](https://codeforces.com/problemset/problem/782/B) `cf-782b` | 1600 | Binary search on real numbers | Ternary search (unimodal) (accepted) | yes | — | — |
| [Devu and his Brother](https://codeforces.com/problemset/problem/439/D) `cf-439d` | 1700 | Ternary search (unimodal) | Two pointers / sliding window (accepted) | yes | — | — |
| [Inversion Count](https://www.spoj.com/problems/INVCNT/) `spoj-invcnt` | M (estimate) | Merge sort / inversion counting | Fenwick tree (BIT) (accepted) | yes | — | — |
| [Magic Ship](https://codeforces.com/problemset/problem/1117/C) `cf-1117c` | 1900 | Binary search on the answer | — | yes | — | — |
| [Multiplication Table](https://cses.fi/problemset/task/2422) `cses-2422` | M (usaco) | k-th element via binary search on value | — | yes | — | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Max Median](https://codeforces.com/problemset/problem/1486/D) `cf-1486d` | 2100 | Binary search on the answer | — | yes | — | — |
| [Toss a Coin to Your Graph...](https://codeforces.com/problemset/problem/1679/D) `cf-1679d` | 1900 | Binary search on the answer | Topological sort (accepted) | yes | — | — |
| [Tricky Function](https://codeforces.com/problemset/problem/429/D) `cf-429d` | 2200 | Classic divide & conquer | Closest pair of points (accepted) | yes | — | — |
| [Lizard Era: Beginning](https://codeforces.com/problemset/problem/585/D) `cf-585d` | 2300 | Meet in the middle | — | yes | — | — |
| [New Roads Queries](https://cses.fi/problemset/task/2101) `cses-2101` | H (estimate) | Parallel binary search | Disjoint set union (accepted); LCA / binary lifting (accepted) | yes | — | — |

## Segment Tree / Range Queries

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Static Range Sum Queries](https://cses.fi/problemset/task/1646) `cses-1646` | E (usaco) | Prefix sums (static) | Fenwick tree (BIT) (overkill); Segment tree: point update, range query (overkill) | **no** | — | cses-1648 |
| [Static Range Minimum Queries](https://cses.fi/problemset/task/1647) `cses-1647` | E (usaco) | Sparse table (static RMQ) | Segment tree: point update, range query (overkill) | yes | — | cses-1649 |
| [Dynamic Range Sum Queries](https://cses.fi/problemset/task/1648) `cses-1648` | E (usaco) | Fenwick tree (BIT) | Segment tree: point update, range query (accepted) | **no** | — | cses-1646 |
| [Dynamic Range Minimum Queries](https://cses.fi/problemset/task/1649) `cses-1649` | E (usaco) | Segment tree: point update, range query | — | **no** | — | cses-1647 |
| [Range Update Queries](https://cses.fi/problemset/task/1651) `cses-1651` | E (estimate) | BIT on a difference array (range add, point query) | Lazy propagation (range update, range query) (overkill) | **no** | — | — |

### Medium

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Hotel Queries](https://cses.fi/problemset/task/1143) `cses-1143` | E/M (estimate) | Segment tree descent (first ≥ x / k-th) | — | yes | — | — |
| [Subarray Sum Queries](https://cses.fi/problemset/task/1190) `cses-1190` | M (estimate) | Segment tree with a custom merged node | — | yes | — | — |
| [Range Updates and Sums](https://cses.fi/problemset/task/1735) `cses-1735` | M (estimate) | Lazy propagation (range update, range query) | — | yes | — | — |
| [Distinct Values Queries](https://cses.fi/problemset/task/1734) `cses-1734` | M (usaco) | Offline sort + BIT sweep | Mo's algorithm (offline sqrt) (accepted); Persistent segment tree (accepted) | yes | — | — |
| [Xenia and Bit Operations](https://codeforces.com/problemset/problem/339/D) `cf-339d` | 1700 | Segment tree with a custom merged node | — | yes | — | — |

### Hard

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Circular RMQ](https://codeforces.com/problemset/problem/52/C) `cf-52c` | 2200 | Lazy propagation (range update, range query) | — | yes | — | — |
| [The Child and Sequence](https://codeforces.com/problemset/problem/438/D) `cf-438d` | 2300 | Segment tree beats / amortized range ops | — | yes | — | — |
| [Range Queries and Copies](https://cses.fi/problemset/task/1737) `cses-1737` | H (estimate) | Persistent segment tree | — | yes | — | — |
| [Powerful array](https://codeforces.com/problemset/problem/86/D) `cf-86d` | 2200 | Mo's algorithm (offline sqrt) | — | **no** | — | — |
| [MEX Queries](https://codeforces.com/problemset/problem/817/F) `cf-817f` | 2300 | Dynamic (implicit) segment tree / compression | Lazy propagation (range update, range query) (accepted); Segment tree descent (first ≥ x / k-th) (accepted) | yes | — | — |

## None of these (greedy / ad hoc)

Distractors: their correct subject is *None of these (greedy / ad hoc)*. `appearsIn` puts them into the sessions listed.

### Easy

| Problem | Difficulty | Intended technique | Also accepted | Constraints checked | Extra layers | Pair |
|---|---|---|---|---|---|---|
| [Hit the Lottery](https://codeforces.com/problemset/problem/996/A) `cf-996a` | 800 | Greedy | — | yes | — | cses-1634 |
| [Movie Festival](https://cses.fi/problemset/task/1629) `cses-1629` | E (estimate) | Greedy | — | **no** | — | — |
