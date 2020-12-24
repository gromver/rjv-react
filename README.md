# rjv-react

React components for creating forms powered by [Rjv](https://github.com/gromver/rjv) (Reactive JSON Validator)

 - uses the JSON Schema to validate data
 - customizable validation messages
 - supports message localization
 - works in web and native environments
 - suitable for any UI components library

#### Contents
 - [Install](#install)
 - [Why?](#why)
 - [Guide](#guide)
 - [Components](#components)
 - [Hooks](#hooks)

## Install
```
yarn add rjv rjv-react
```

## Why?
As you probably know, JSON schema is a powerful and well-known approach for data validation, widely used in the back-end of applications. Thus, this library is an attempt to port JSON Schemas to create simple or complex forms in React JS applications. The [rjv](https://github.com/gromver/rjv) library is used as the JSON validator, it provides simplified standard JSON schema [keywords](https://github.com/gromver/rjv#keywords) adopted for the front-end needs, as well as some additional keywords like `validate` or `resolveSchema` that allow you to create validation rules at runtime.

## Guide
 - [First form](#first-form)
 - [Higher-Order Fields (HOF)](#higher-order-fields-hof)
 - [Submitting form](#submitting-form)
 - [Errors](#errors)
 - [Scopes](#scopes)
 - [Default settings](#default-settings)


### First form
Lets make our first form. To validate data of each field, we have to use JSON schema.
JSON schema is a simple object with a set of keywords that describe how the data should be validated.
```jsx
import { FormProvider, Field, Submit } from 'rjv-react';

const initialData = {}

function SignInForm() {
  return <FormProvider data={initialData}>
    <Field
      path="login"
      schema={{
        default: '', type: 'string', presence: true, format: 'email'
      }}
      render={(ref, inputRef) => {
        return <input
          ref={inputRef}
          placeholder="Login"
          value={ref.value}
          onChange={(e) => ref.value = e.target.value}
          onBlur={() => ref.validate()}
        />
      }}
    />
    <Field
      path="password"
      schema={{
        default: '', type: 'string', presence: true
      }}
      render={(ref, inputRef) => {
        return <input
          ref={inputRef}
          placeholder="Password"
          type="password"
          value={ref.value}
          onChange={(e) => ref.value = e.target.value}
          onBlur={() => ref.validate()}
        />
      }}
    />
    <Submit
      onSuccess={(data) => console.log(data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
    />
  </FormProvider>
}
```
This form is extremely simple, it is able only to check the data and log it if it valid. There is no any feedback about errors. But it is not problem - it will be fixed further.

### Higher-Order Fields (HOF)
As the `rjv-react` library works in any environment (web/native) and with any 3d party UI
components framework, it would be better to create a set of higher-order field components to simplify form development. Now we gonna create a smart input field.

`components/InputField.js`
```typescript jsx
import React from 'react';
import { types } from 'rjv';
import { Field } from 'rjv-react';

type InputFieldProps = {
  path: string;
  label: React.ReactNode;
  schema?: types.ISchema;
  placeholder?: string;
  inputProps?: {} // other input control props
}

export default function InputField (props) {
  return 
    <Field
      path={path}
      schema={schema}
      render={(field, inputRef) => {
        const fieldClassName = ['field-row'];
        if (field.state.isTouched) fieldClassName.push('touched');
        if (field.state.isDirty) fieldClassName.push('dirty');

        return (
          <div className={fieldClassName.join(' ')}>
            <label className="field-label">
              {label}
            </label>
            <div className="field-control">
              <Input
                ref={inputRef}  // bind input control to a "name" property
                value={field.value} // display actual value
                onFocus={() => field.markAsTouched()} // change UI state
                onChange={(e) => field.markAsDirty().value = e.target.value}  // change value and UI state
                onBlur={() => field.state.isDirty && field.validate()}  // validate value when "onBlur" event occurs
                disabled={field.state.isReadOnly} // disable input if property marked as readonly
                placeholder={placeholder}
              />
            </div>
            {/* show error if needed */}
            {field.state.isValidated && !field.state.isValid
              && <div className="field-error">{field.messageDescription}</div>}
          </div>
        );
      }}
    />
}
``` 
Now the "Sign In" form might look like:

`components/SignInForm.js`
```jsx
import { FormProvider, Submit } from 'rjv-react';
import InputField from './InputField.js'

const initialData = {}

export default function SignInForm() {
  return <FormProvider data={initialData}>
    <InputField
      path="login"
      label="Login"
      schema={{ default: '', type: 'string', presence: true, format: 'email' }}
    />
    <InputField
      path="password"
      label="Password"
      schema={{ default: '', type: 'string', presence: true }}
      inputProps={{ type: 'password' }}
    />
    <Submit
      onSuccess={(data) => console.log(data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
    />
  </FormProvider>
}
```
This is very rough and simple example, in practice HOF components could be more functional and flexible.
> Further, the HOF components will be used to simplify form examples

### Submitting form
There are two ways to submit a form:
 - `Submit` component
 - Using `submit` function

#### `Submit` component
It is the easiest approach. You need to wrap your submit button with the `Submit` component.
```jsx
import { FormProvider, Submit } from 'rjv-react';
import InputField from './InputField.js'

export default function SignInForm() {
  return <FormProvider data={{}}>
    <InputField
      path="login"
      label="Login"
      schema={{
        default: '', type: 'string', presence: true, format: 'email'
      }}
    />
    <InputField
      path="password"
      label="Password"
      schema={{
        default: '', type: 'string', presence: true
      }}
      inputProps={{ type: 'password' }}
    />
    {/* Submitting form */}
    <Submit
      onSubmit={(data) => console.log('Validating data:', data)}
      onError={(firstErrorField) => console.log('The first error field:', firstErrorField)}
      onSuccess={(data) => console.log('Data is valid:', data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
      focusFirstError // autofocus first error component
    />
  </FormProvider>
}
```
#### Using `submit` function
The `submit` function is a simple async function launching the validation process of the entire model,
it returns a data validation result.
```typescript
type SubmitFormFn = () => Promise<{
  // is data valid?
  valid: boolean
  // data
  data?: any
  // the FieldApi instance of the first error data property
  firstErrorField?: FieldApi
}>
```
The `submit` function can be obtained in two ways:
 - get the ref of the `FormProvider` component
    ```jsx
    import React, { useCallback } from 'react';
    import { FormProvider, FormProviderRef } from 'rjv-react';
    import InputField from './InputField.js'
    
    export default function SignInForm() {
      const formRef = useRef<FormProviderRef>()
    
      const handleSubmit = useCallback(async () => {
        if (formRef.current) {
          const { submit } = formRef.current
    
          const { valid, data, firstErrorField } = await submit()
    
          if (valid) {
            console.log(model.data)
          } else {
            // focus first error control
            firstErrorField.focus()
          }
        }
      }, [formRef])
    
      return <FormProvider ref={formRef} data={{}}>
        <InputField
          path="login"
          label="Login"
          schema={{
            default: '', type: 'string', presence: true, format: 'email'
          }}
        />
        <InputField
          path="password"
          label="Password"
          schema={{
            default: '', type: 'string', presence: true
          }}
          inputProps={{ type: 'password' }}
        />
        {/* Submitting form */}
        <button onClick={handleSubmit}>Sign In</button>
      </FormProvider>
    }
    ```

 - using `useForm` hook
    ```jsx
    import React, { useCallback } from 'react';
    import { FormProvider, useForm } from 'rjv-react';
    import InputField from './InputField.js'
    
    function SubmitBtn(props) {
      const form = useForm()
    
      const handleSubmit = useCallback(async () => {
        if (form) {
          const { submit } = form
    
          const { valid, data, firstErrorField } = await submit()
    
          if (valid) {
            console.log(model.data)
          } else {
            // focus first error control
            firstErrorField.focus()
          }
        }
      }, [form])
    
      return <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          {props.children}
        </button>
    }
    
    export default function SignInForm() {
      return <FormProvider data={{}}>
        <InputField
          path="login"
          label="Login"
          schema={{
            default: '', type: 'string', presence: true, format: 'email'
          }}
        />
        <InputField
          path="password"
          label="Password"
          schema={{
            default: '', type: 'string', presence: true
          }}
          inputProps={{ type: 'password' }}
        />
        {/* Submitting form */}
        <SubmitBtn>Sign In</SubmitBtn>
      </FormProvider>
    }
    ```

### Scopes
The `Scope` component define the path to the data property against which the nested components will resolve their relative paths.
> By default, the `FormProvider` component sets scope to the root path `/`.

`components/ProfileForm.js`
```jsx
import { FormProvider, Submit, Scope } from 'rjv-react';
import InputField from './InputField.js'

export default function ProfileForm() {
  return <FormProvider data={{}}>
    <InputField
      path="name"
      label="Name"
      schema={{ default: '', type: 'string', presence: true }}
    />
    {/* without scope point to "placement/country" prop */}
    <InputField
      path="placement/country"
      label="Country"
      schema={{ default: '', type: 'string', presence: true }}
    />
    {/* use scope to point to "placement/city" prop */}
    <Scope path="placement">
      <InputField
        path="city"
        label="City"
        schema={{ default: '', type: 'string', presence: true }}
      />
    </Scope>

    <Submit
      // { name: 'John', placement: { country: 'UK', city: 'London' } }
      onSuccess={(data) => console.log(data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
    />
  </FormProvider>
}
```

### Default settings
The `OptionsProvider` component allows customizing default form options.
Typically, `OptionsProvider` is applied once at the top-level of the application, but it can be used in certain parts of the application to provide different default settings.
```typescript jsx
import { types } from 'rjv'
import { OptionsProvider } from 'rjv-react'

const DEFAULT_FORM_OPTIONS = {
  errors: {
    minLength: 'The value must be at least {limit} characters.',
    // customize other error messages...
  }
}

export default function ProfileForm() {
  return <OptionsProvider {DEFAULT_FORM_OPTIONS}>
    {/* the rest of application */}
  </OptionsProvider>
}
```

## Components

 - [OptionsProvider](#optionsprovider)
 - [FormProvider](#formprovider)
 - [ErrorProvider](#errorprovider)
 - [ErrorMessages](#errormessages)
 - [Field](#field)
 - [Scope](#scope)
 - [Submit](#submit)
 - [Watch](#watch)
 - [VisibleWhen](#visiblewhen)

### OptionsProvider
Provides default form options. This options will be used as default at the `FormProvider` component level.
One of the main purposes of the `OptionsProvider` component is setting up localized validation messages of the application.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`coerceTypes` | boolean| false | enable coerce types feature
`removeAdditional` | boolean | false | enable remove additional properties feature
`errors` | `{ [keywordName: string]: string }` | {} | custom error messages
`warnings` | `{ [keywordName: string]: string }` | {} | custom warning messages
`keywords` | `IKeyword[]` | [] | additional validation keywords
`descriptionResolver` | `(message: ValidationMessage) => string` | `(message) => message.toString()` | function resolving validation message descriptions

### FormProvider
Provides a form context.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`data` | `any` | undefined | the initial form data
`ref` | `React.RefObject<FormProviderRef>` | undefined | returns an object contains an API to work with the form

#### FormProviderRef:
```typescript
type FormProviderRef = {
  // async fn submitting form and returning validation result 
  submit: () => Promise<{
    valid: boolean
    data?: any
    firstErrorField?: FieldApi
  }>
  // get form data
  getData: () => any
  // get field api if exists
  getField: (path: string) => FieldApi | undefined
  // get errors list in order of appearance in the form
  getErrors: () => [path: string, message: string][]
}
```
See [`FieldApi`](#fieldapi)

### ErrorProvider

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | `string`| undefined | specifies data property

### ErrorMessages

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(errors: ValidationErrors) => ReactNode` | undefined | a function rendering errors. See [ValidationErrors](#validationerrors)


### Field
The `Field` component is responsible for rendering the specific data property.
It takes the render function of the field control and invokes it each time the value or validation/UI state of the data property changed.
The field control render function gets a [field](#fieldapi) api object, using this api it is able to handle these issues:
 - Changing value
 - Getting/Setting UI state (pristine/touched/dirty/valid etc)
 - Validating value
 - Rendering the field control with actual validation/UI state

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | `string`| undefined | specifies data property
`schema`* | `Object<JSON Schema>` | undefined | schema is used to validate field, only works in forms with [composed schema](#composed schema)
`render`* | `(field, inputRef) => ReactNode` | undefined | a function rendering the UI of the field, it gets arguments: `field` is a [FieldApi](#fieldapi) instance of the data property, `inputRef` should be a `React.RefObject` object that can be used to store the reference to the input component, later this ref can be used to focus an invalid input component.

#### FieldApi
```typescript
type FieldApi = {
  value: any
  state: FieldState
  ref: types.IRef
  messageDescription: string | undefined
  isRequired: boolean
  isReadonly: boolean
  validate (): Promise<types.IValidationResult>
  focus (): void
  markAsTouched(): this
  markAsPristine(): this
  markAsDirty(): this
  markAsInvalidated(): this
}
```

#### FieldState
```typescript
type FieldState = {
  isValid: boolean,
  isValidating: boolean,
  isValidated: boolean,
  isPristine: boolean,
  isTouched: boolean,
  isDirty: boolean,
  isRequired: boolean,
  isReadonly: boolean,
  message?: ValidationMessage
}
```
See [ValidationMessage](#todo)

### Scope
Sets the data scope of the form - all relative paths will be resolved against the nearest scope up the component tree.
By default `FormProvider` component sets the scope to the root `/` path.

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | string | undefined | specifies scope

### Submit
Component based form submitting.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(handleSubmitFn) => ReactNode` | undefined | a function rendering the UI of the field, it gets a `handleSubmitFn` function which should be called to submit a form.
`onSubmit` | `(data: any) => void` | undefined | a callback function to be called when the form submission process begins
`onSuccess` | `(data: any) => void` | undefined | a callback function to be called after `onSubmit` if the form data is valid
`onError` | `(firstErrorField: FieldApi) => void` | undefined | a callback function to be called after `onSubmit` if the form data is invalid. See [FieldApi](#fieldapi)
`focusFirstError` | boolean | true | if "true" tries to focus first invalid input control after the form submission

### Watch
Re-renders content when desired events of the certain field are acquired

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(getRef, getField) => ReactNode` | undefined | a function rendering some UI content when changes occur. todo...
`props` | `Path[]` | [] | a list of properties to watch, each property path can be relative or absolute and contain wildcards `*` or `**`
`events` | `EventType[]` | "any" | the type of events to subscribe to
`debounce` | `number` | 0 ms | debounce re-render,

EventType:
```typescript
type EventType =
  'valueChanged'      // value changing events
  | 'validated'       // field was validated
  | 'invalidated'     // field was invalidated
  | 'registerField'   // a new field was attached to the form
  | 'unregisterField' // the field was excluded from the form
```

### VisibleWhen
Shows children content when the data is correct
Name | Type | Default | Description
--- | :---: | :---: | ---
`path` | `string`| '/' | absolute or relative path to data
`schema`* | `Object<JSON Schema>` | undefined | schema used to check data
`useVisibilityStyle`* | `boolean` | false | use css visibility style and do not unmount children components
`visibleStyles`* | `CSSProperties` | undefined | css styles for the visible content
`hiddenStyles`* | `CSSProperties` | undefined | css styles for the hidden content

## Hooks
 - [useForm](#useform--formapi)
 - [useField](#usefieldpath-string--fieldapi--undefined)
 - [useErrors](#useerrors--validationerrors)

### `useForm() => FormApi`
This hook returns a form api related to the closest `FormProvider` component.

#### FormApi
```typescript
type FormApi = {
  submit: SubmitFormFn
  getData: () => any
  getField: (path: types.Path) => IFieldApi | undefined
  getErrors: () => ValidationErrors
  scope: string
}
```

### `useField(path: string) => FieldApi | undefined`
Returns a field [api](#fieldapi) if it exists. Path can be absolute or relative.

### `useErrors() => ValidationErrors`
Returns a list of errors caught by [ErrorProvider](#errorprovider) component

#### ValidationErrors
```typescript
type ValidationErrors = [path: string, message: string][]
```

## License
**rjv-react** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rjv-react/blob/master/LICENSE
