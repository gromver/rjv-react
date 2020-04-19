/**
 *
 * SchemaRef - subscribes to field events and exposes validation schema for the given ref
 *
 */

import React, { memo, useEffect } from 'react'
import assign from 'lodash/assign'
import isEqual from 'lodash/isEqual'
import { Ref, utils, types } from 'rjv'
import { Connect } from '../Connect'
import { SchemaCollector } from '../SchemaCollector'

/**
 * Builds json schema for the prop validation on specified path
 * @param path
 * @param schema
 */
export function buildSchema (path: types.Path, schema: types.ISchema): types.ISchema {
  const slugs = utils.pathToArray(path)

  const resSchema: types.ISchema = {}
  let leaf: types.ISchema = resSchema

  slugs.forEach((slug) => {
    if (typeof slug === 'string') {
      const propSchema = {}
      leaf.properties = {
        [slug]: propSchema
      }
      leaf = propSchema
    } else {
      const itemsSchema = {}
      leaf.items = itemsSchema
      leaf = itemsSchema
    }
  })

  assign(leaf, schema)

  return resSchema
}

type Props = {
  render: (ref: Ref) => React.ReactNode
  field: Ref
  schema: types.ISchema
  schemaCollector: SchemaCollector
}

function SchemaRef (props: Props) {
  const { field, render, schema, schemaCollector } = props

  useEffect(() => {
    const builtSchema = buildSchema(field.path, schema)

    schemaCollector.add(builtSchema)
  }, [schemaCollector, schema, field])

  // on destroy the schema of the model should be invalidated
  useEffect(() => () => {
    schemaCollector.invalidate()
  }, [])

  return (
    <Connect
      render={render}
      observe={[field.path]}
      args={[field]}
      observeMode="field"
    />
  )
}

export default memo<Props>(SchemaRef, isEqual)
