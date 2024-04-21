import * as React from 'react'
import * as Reactodia from '@reactodia/workspace'
import * as N3 from 'n3'

// const GRAPH_DATA =
//
//   `https://raw.githubusercontent.com/reactodia/reactodia-workspace/master/examples/resources/orgOntology.ttl`


const turtle = `<http://example.org/note/Alice.md> <http://pkm-united.org/contains> _:c14n0 .
<http://example.org/note/Alice.md> <http://pkm-united.org/wikipath> "Alice.md" .
<http://example.org/note/Alice.md> <http://schema.org/name> "Alice" .
<http://example.org/note/Alice.md> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://pkm-united.org/Note> .
<http://example.org/note/WhiteRabbit.md> <http://pkm-united.org/contains> _:c14n2 .
<http://example.org/note/WhiteRabbit.md> <http://pkm-united.org/wikipath> "WhiteRabbit.md" .
<http://example.org/note/WhiteRabbit.md> <http://schema.org/name> "WhiteRabbit" .
<http://example.org/note/WhiteRabbit.md> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://pkm-united.org/Note> .
<http://example.org/property/loves%20to%20drink%20tea%20with> <http://schema.org/name> "loves to drink tea with" .
_:c14n0 <http://pkm-united.org/selector> "Alice" .
_:c14n0 <http://pkm-united.org/wikipath> "Alice.md" .
_:c14n0 <http://schema.org/image> <https://miro.medium.com/max/1100/1*xupcHn3b0jEFPkjvuH5Pbw.jpeg> .
_:c14n0 <http://schema.org/name> "Alice" .
_:c14n0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Contact> .
_:c14n0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://pkm-united.org/Block> .
_:c14n1 <http://pkm-united.org/selector> "Wozenderlands" .
_:c14n1 <http://pkm-united.org/wikipath> "WhiteRabbit.md" .
_:c14n1 <http://schema.org/name> "Wozenderlands" .
_:c14n1 <http://schema.org/postalCode> "4879" .
_:c14n1 <http://schema.org/streetAddress> "5 Wonderland Street" .
_:c14n1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://pkm-united.org/Block> .
_:c14n1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Place> .
_:c14n2 <http://example.org/property/loves%20to%20drink%20tea%20with> <http://example.org/note/Alice.md> .
_:c14n2 <http://pkm-united.org/contains> _:c14n1 .
_:c14n2 <http://pkm-united.org/selector> "White rabbit" .
_:c14n2 <http://pkm-united.org/wikipath> "WhiteRabbit.md" .
_:c14n2 <http://schema.org/address> _:c14n1 .
_:c14n2 <http://schema.org/image> <https://miro.medium.com/max/720/1*HZazTjGg9EBSOoz34IN-tA.jpeg> .
_:c14n2 <http://schema.org/name> "White rabbit" .
_:c14n2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Contact> .
_:c14n2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://pkm-united.org/Block> .

`
// Use background Web Worker to compute graph layout
const Layouts = Reactodia.defineLayoutWorker(() => new Worker(
  new URL('@reactodia/workspace/layout.worker', import.meta.url),
))

function BasicExample () {
  const { defaultLayout } = Reactodia.useWorker(Layouts)

  const { onMount } = Reactodia.useLoadedWorkspace(
    async ({ context, signal }) => {
      const { model, performLayout } = context
      // Fetch graph data to use as underlying data source
      // const response = await fetch(GRAPH_DATA, { signal })

      // const graphData = new N3.Parser().parse(await response.text())
      const graphData = new N3.Parser().parse(turtle)

      const dataProvider = new Reactodia.RdfDataProvider(
        { acceptBlankNodes: false })
      dataProvider.addGraph(graphData)

      // Create empty diagram and put owl:Class entities with links between them
      await model.createNewDiagram({ dataProvider, signal })
      const elementTypeId = 'http://www.w3.org/2002/07/owl#Class'
      for (const { element } of await dataProvider.lookup({ elementTypeId })) {
        model.createElement(element)
      }
      await model.requestLinksOfType()

      // Layout elements on canvas
      await performLayout({ signal })
    }, [])

  return (
    <Reactodia.Workspace ref={onMount}
                         defaultLayout={defaultLayout}>
      <Reactodia.DefaultWorkspace/>
    </Reactodia.Workspace>
  )
}

export default BasicExample

