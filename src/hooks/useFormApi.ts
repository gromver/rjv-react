import { useContext, useMemo } from 'react'
import { utils } from 'rjv'
import DataContext from '../contexts/DataContext'
import FormContext from '../contexts/FormContext'
import { FormApi, ValidationErrors } from '../types'
import EmittingRef from '../refs/EmittingRef'
import OptionsContext from '../contexts/OptionsContext'
import FieldContext from '../contexts/FieldContext'

export default function useFormApi (): FormApi {
  const formContext = useContext(FormContext)
  const dataContext = useContext(DataContext)
  const fieldContext = useContext(FieldContext)
  const optionsContext = useContext(OptionsContext)

  if (!formContext || !dataContext || ! fieldContext || !optionsContext) {
    throw new Error('useFormApi - form is not provided')
  }

  return useMemo(
    () => ({
      submit: formContext.submit,
      validate: formContext.validate,
      getDataRef: (path = '/') => {
        const _path = utils.resolvePath(path, '/')

        return new EmittingRef(dataContext.dataStorage, _path, fieldContext.emitter)
      },
      getErrors: () => {
        const res: ValidationErrors = []

        fieldContext.fields.forEach((state, field) => {
          if (state.isValidated && !state.isValid) {
            const message = state.message && optionsContext.descriptionResolver(state.message) || ''

            res.push({path: field.ref().path, message})
          }
        })

        return res
      }
    }),
    [formContext, fieldContext.emitter, optionsContext]
  )
}
