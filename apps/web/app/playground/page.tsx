import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopNav } from "@/components/marketing/top-nav";
import { KnnVisualizer } from "@/components/viz/knn-visualizer";
import { KMeansVisualizer } from "@/components/viz/kmeans-visualizer";
import { GradientDescentVisualizer } from "@/components/viz/gradient-descent-visualizer";
import { NeuralNetworkVisualizer } from "@/components/viz/neural-network-visualizer";
import { AgentGraphVisualizer } from "@/components/viz/agent-graph-visualizer";
import { EmbeddingSpaceVisualizer } from "@/components/viz/embedding-space-visualizer";
import { PyodidePlayground } from "@/components/playground/pyodide-playground";
import { Footer } from "@/components/marketing/footer";

const SANDBOX_CODE = `import numpy as np

# A blank scikit-learn + numpy sandbox -- edit this and hit Run.
X = np.array([[1, 2], [2, 3], [3, 4], [8, 8], [9, 9], [10, 8]])
y = np.array([0, 0, 0, 1, 1, 1])

from sklearn.neighbors import KNeighborsClassifier
clf = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print("Prediction for [5, 5]:", clf.predict([[5, 5]])[0])
`;

function PlaygroundSection({
  title,
  from,
  href,
  children,
}: {
  title: string;
  from: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          From {from} <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

export default function PlaygroundPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Playground</h1>
        <p className="mb-12 max-w-xl text-fd-muted-foreground">
          Every live simulation on this platform, in one place — no need to hunt through a lesson to try one.
          Each is pulled straight from its course; click through for the full explanation.
        </p>

        <PlaygroundSection title="K-Nearest Neighbors" from="Classical ML" href="/docs/courses/classical-ml/instance-based-and-linear-models/knn">
          <KnnVisualizer />
        </PlaygroundSection>

        <PlaygroundSection
          title="K-Means Clustering"
          from="Classical ML"
          href="/docs/courses/classical-ml/clustering-and-dimensionality-reduction/k-means"
        >
          <KMeansVisualizer />
        </PlaygroundSection>

        <PlaygroundSection
          title="Gradient Descent"
          from="Classical ML"
          href="/docs/courses/classical-ml/instance-based-and-linear-models/linear-regression"
        >
          <GradientDescentVisualizer />
        </PlaygroundSection>

        <PlaygroundSection
          title="Neural Network Forward Pass"
          from="Deep Learning"
          href="/docs/courses/deep-learning/neural-network-foundations/the-perceptron-and-mlp"
        >
          <NeuralNetworkVisualizer />
        </PlaygroundSection>

        <PlaygroundSection
          title="Embedding Space"
          from="NLP & LLM Foundations"
          href="/docs/courses/nlp-and-llm-foundations/tokenization-and-embeddings/embeddings"
        >
          <EmbeddingSpaceVisualizer />
        </PlaygroundSection>

        <PlaygroundSection
          title="Agent Graph Execution"
          from="Agentic AI"
          href="/docs/courses/agentic-ai/langgraph-fundamentals/langgraph-basics"
        >
          <AgentGraphVisualizer />
        </PlaygroundSection>

        <PlaygroundSection title="Python Sandbox" from="scratch — try anything" href="/docs">
          <PyodidePlayground initialCode={SANDBOX_CODE} />
        </PlaygroundSection>
      </main>
      <Footer />
    </>
  );
}
