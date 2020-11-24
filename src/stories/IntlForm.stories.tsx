import React, { useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { IntlProvider, useIntl } from 'react-intl'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors, SubmitBtn } from './helpers'
import { FormProvider, Field, ErrorProvider } from '../index'
import { OptionsProvider } from '../components/OptionsProvider'

const messages = {
  ru: {
    'error.presence': 'Это поле должно быть заполнено',
    'error.format': 'Поле должно быть формата "{format}"'
  },
  en: {
    'error.presence': 'This field is required',
    'error.format': 'The value of the field must have "{format}" format'
  }
}

storiesOf('Form', module)
  .add('Intl', () => {
    const [locale, setLocale] = useState('ru')
    return (
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en">
        <Form.Item
          label="Language"
        >
          <Select value={locale} onChange={(v) => setLocale(v)}>
            <Select.Option value="ru">Русский</Select.Option>
            <Select.Option value="en">English</Select.Option>
          </Select>
        </Form.Item>

        <br />

        <h3>Form</h3>

        <IntlForm />
      </IntlProvider>
    )
  })

const initialData = {}

function IntlForm () {
  const intl = useIntl()
  const descriptionResolver = useMemo(() => ((message) => {
    if (intl.messages[message.description]) {
      return intl.formatMessage(
        { id: message.description, defaultMessage: message.description },
        message.bindings
      )
    }

    return message.toString()
  }), [intl])

  return (
    <Form style={{ maxWidth: '400px' }}>
      <OptionsProvider descriptionResolver={descriptionResolver}>
        <FormProvider data={initialData}>
          <ErrorProvider>
            <ShowErrors />

            <br />

            <Field
              path="field"
              schema={{
                type: 'string',
                presence: true,
                minLength: 3,
                format: 'email',
                errors: {
                  presence: 'error.presence',
                  format: 'error.format'
                }
              }}
              render={(field) => {
                return (
                  <Form.Item
                    label="Field"
                    validateStatus={getValidationStatus(field)}
                    help={field.messageDescription}
                    required={field.isRequired}
                  >
                    <Input
                      value={field.value}
                      onChange={(e) => field.value = e.target.value}
                      onBlur={() => field.validate()}
                    />
                  </Form.Item>
                )
              }}
            />

            <SubmitBtn />
          </ErrorProvider>
        </FormProvider>
      </OptionsProvider>
    </Form>
  )
}
