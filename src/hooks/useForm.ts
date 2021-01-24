import { useContext, useMemo } from 'react'
import { utils } from 'rjv'
import DataContext from '../contexts/DataContext'
import FormContext from '../contexts/FormContext'
import FormStateContext from '../contexts/FormStateContext'
import { FormApi, FormState, ValidationErrors } from '../types'
import EmittingRef from '../refs/EmittingRef'
import OptionsContext from '../contexts/OptionsContext'
import FieldContext from '../contexts/FieldContext'

export type FormInfo = {
  state: FormState
  form: FormApi
}

export default function useForm (): FormInfo {
  const formContext = useContext(FormContext)
  const formState = useContext(FormStateContext)
  const dataContext = useContext(DataContext)
  const fieldContext = useContext(FieldContext)
  const optionsContext = useContext(OptionsContext)

  if (!formContext || !formState || !dataContext || ! fieldContext || !optionsContext) {
    throw new Error('useForm - form is not provided')
  }

  return useMemo(() => ({
    state: formState,
    form: {
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
    }
  }), [formState, formContext, fieldContext.emitter, optionsContext])
}
