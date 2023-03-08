import { readFile } from 'fs/promises'
import { createTriplifier } from 'vault-triplifier'
import { resolve } from 'path'
import ns from './namespaces.js'
import rdf from './rdf-ext.js'

const triplifyOptions = {
  baseNamespace: ns.ex,
  addLabels: true,
  includeWikipaths: true,
  splitOnHeader: true,
  namespaces: ns,
  customMappings: {
    'lives in': ns.schema.address,
  },
}

async function getDataset (dir) {
  const dataset = rdf.dataset()
  const triplifier = await createTriplifier(dir)

  for (const file of triplifier.getFiles()) {
    console.log('Processing file:', file)
    const text = await readFile(resolve(dir, file), 'utf8')
    const pointer = triplifier.toRDF(text, { path: file }, triplifyOptions)

    for (const quad of pointer.dataset) {
      const withGraph = rdf.quad(quad.subject, quad.predicate, quad.object,
        pointer.term)
      dataset.add(withGraph)
    }
  }

}

export { getDataset }

