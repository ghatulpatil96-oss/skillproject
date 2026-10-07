import { MDXRemote } from "next-mdx-remote/rsc";
import CodeBlock from "./CodeBlock";
import Quiz from "./Quiz";

type AnyComponentMap = Record<string, React.ComponentType<any>>;

export default function MDXRenderer({ source }: { source: string }) {
  return (
    <article className="mt-8">
      <MDXRemote
        source={source}
        // v6 strips JSX attribute expressions by default (blockJS) — that would
        // delete Quiz's questions={[...]} prop. Disabling it keeps the
        // dangerous-calls safety plugin (blockDangerousJS) active.
        options={{ blockJS: false }}
        components={{ pre: CodeBlock, Quiz } as AnyComponentMap}
      />
    </article>
  );
}
