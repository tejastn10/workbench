# skills/study

Learning something properly: lessons, papers, flows, and checking that it stuck.
The output is interactive: each skill writes a self-contained HTML page (published as
an Artifact when the host supports it), not a wall of chat.

| Skill                 | Use for                                                   |
| --------------------- | ----------------------------------------------------- |
| `study/head-first`    | Teach any topic the Head First way: problem first, pictures with words in them, the name last, interactive lessons over several sessions |
| `study/dissect-paper` | Take a research paper apart: three passes, its history and references, equations explained step by step, interactive figures, critique |
| `study/flow-diagram`  | A diagram you step through: one question, 5–12 grounded nodes, a narrated stepper with the unhappy path |
| `study/feynman-check` | Explain it back from memory; get graded one gap at a time against a six-gap rubric |

They compose: a `head-first` lesson or a `dissect-paper` read embeds `flow-diagram`
steppers and ends with a `feynman-check`. For a static figure to put in a doc, use
`visual/diagram`. For a machine-like explainer, use `visual/anatomy`.

Credits: the Head First method is Kathy Sierra and Bert Bates's (O'Reilly); the
`head-first` workspace adapts [mattpocock/skills](https://github.com/mattpocock/skills)
`teach`. `dissect-paper` uses S. Keshav's "How to Read a Paper" (2007), plus ideas
from [karpathy/nanochat](https://github.com/karpathy/nanochat) `read-arxiv-paper` and
[a1henu/paper-reading-skill](https://github.com/a1henu/paper-reading-skill).
`feynman-check` adapts [haunguyendev/feynman-skill](https://github.com/haunguyendev/feynman-skill)
and [Freya0525/supertutor-skill](https://github.com/Freya0525/supertutor-skill). All MIT.
