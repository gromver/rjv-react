# rjv-react

React components for creating forms powered by [Rjv](https://github.com/gromver/rjv) (Reactive JSON Validator)

 - uses the JSON Schema to validate data
 - customizable validation messages
 - supports message localization
 - works in web and native environments
 - suitable for any UI components library

#### Contents
 - [Install](#install)
 - [Motivation](#motivation)
 - [Guide](#guide)
 - [Components](#components)
 - [Hooks](#hooks)

## Install
```
yarn add rjv rjv-react
```

## Motivation
This library is an attempt to port JSON Schemas to create simple or complex forms in React JS applications.
The [rjv](https://github.com/gromver/rjv) library is used as the JSON validator,
it provides simplified standard JSON schema [keywords](https://github.com/gromver/rjv#keywords) adopted for the front-end needs,
as well as some additional keywords like `validate` or `resolveSchema` that allow you to create validation rules at runtime.

## Guide
 - [Raw sign up form](#raw-sign-up-form)
 - [Higher-Order Fields (HOF)](#higher-order-fields-hof)

### Raw sign up form
For example, let's create a user registration form from scratch.
Each form begins with the `FormProvider` component which creates form and provides the form data.
```typescript jsx
import React, { useState } from 'react';
import { FormProvider, Field, Submit, ErrorMessages } from 'rjv-react';

function SignUpForm() {
  const [initialData] = useState({})

  return <FormProvider data={initialData}>
    <Field
      path="email"
      schema={{
        default: '', presence: true, format: 'email'
      }}
      render={({ state, field, inputRef }) => {
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
        default: '', presence: true
      }}
      render={({ state, field, inputRef }) => {
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
     <Field
       path="confirmPassword"
       schema={{
          default: '',
          const: (propRef) => propRef.ref('/password').value
       }}
       render={({ state, field, inputRef }) => {
          return <input
            ref={inputRef}
            placeholder="Confirm password"
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

    <ErrorMessages
      render={(messages) => messages.map(item => <div key={}>{item.path} - {item.message}</div>)}
    />
  </FormProvider>
}
```

### Higher-Order Fields (HOF)
As the `rjv-react` library works in any environment (web/native) and with any 3d party UI
components framework, it would be better to create a set of higher-order field components to simplify form development.
For example, we can create a couple of the higher order components like `Form` and `InputField` for a web application.

`components/Form.js`
```typescript jsx
import React from 'react';
import { FormProvider, useFormApi } from 'rjv-react';

type FormProps = {
  data: any
  onSuccess: (data) => void | Promise<void>
  children: React.ReactNode
  focusFirstError?: boolean
}

export default function Form (props) {
  const { data, onSuccess, focusFirstError = true, ...restProps} = props
  const { submit } = useFormApi()

  const handleSubmit = useCallback(() => {
     submit(
       onSuccess,
       (firstErrorField) => {
          if (focusFirstError) {
             firstErrorField.focus()
          }
       }
     )
  }, [submit, onSucces])

   return (
     <FormProvider data={props.data}>
        <form {...restProps} onSubmit={handleSubmit} />
     </FormProvider>
   )
}
``` 

`components/InputField.js`
```typescript jsx
import React from 'react';
import { types } from 'rjv';
import { useField } from 'rjv-react';

type InputFieldProps = {
  path: string;
  label: React.ReactNode;
  schema: types.ISchema;
  placeholder?: string;
  inputProps?: {} // other input control props
}

export default function InputField (props) {
  const { path, label, schema, placeholder, inputProps } = props

  const { field, state, inputRef } = useField(path, schema)

  const fieldClassName = ['field-row'];
  if (state.isTouched) fieldClassName.push('touched');
  if (state.isDirty) fieldClassName.push('dirty');

  return (
    <div className={fieldClassName.join(' ')}>
      <label className="field-label">
        {label}
      </label>
      <div className="field-control">
        <Input
          {...inputProps}
          ref={inputRef}  // bind input control to a "name" property
          value={field.value} // display actual value
          onFocus={() => field.touched()} // change UI state
          onChange={(e) => field.dirty().value = e.target.value}  // change value and UI state
          onBlur={() => state.isDirty && field.validate()}  // validate value when "onBlur" event occurs
          disabled={state.isReadOnly} // disable input if property marked as readonly
          placeholder={placeholder}
        />
      </div>
      {/* show error if needed */}
      {state.isValidated && !state.isValid
      && <div className="field-error">{field.messageDescription}</div>}
    </div>
  );
}
``` 
Now the "Sign Up" form might look like:

`components/SignUpForm.js`
```typescript jsx
import React, { useState } from 'react';
import Form from './Form.js'
import InputField from './InputField.js'

export default function SignUpForm() {
  const [initialData] = useState({})

  return <Form data={initialData} onSuccess={(data) => console.log(data)}>
    <InputField
      path="login"
      label="Login"
      schema={{ default: '', presence: true, format: 'email' }}
    />
    <InputField
      path="password"
      label="Password"
      schema={{ default: '', presence: true }}
      inputProps={{ type: 'password' }}
    />
     <InputField
       path="confirmPassword"
       label="Confirm password"
       schema={{
         default: '',
         const: (propRef) => propRef.ref('/password').value
       }}
       inputProps={{ type: 'password' }}
     />

     <button type="submit" onClick={handleSubmit}>Sign In</button>
  </Form>
}
```

## Components

 - [OptionsProvider](#optionsprovider)
 - [FormProvider](#formprovider)
 - [CatchErrors](#catcherrors)
 - [ErrorMessages](#errormessages)
 - [Form](#form)
 - [Field](#field)
 - [FieldArray](#fieldarray)
 - [Scope](#scope)
 - [Submit](#submit)
 - [Watch](#watch)
 - [Property](#property)
 - [VisibleWhen](#visiblewhen)

### OptionsProvider
Provides default form options. This options will be used as default at the `FormProvider` component level.
One of the main purposes of the `OptionsProvider` component is setting up localized validation messages of the application.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`children`* | `ReactNode` | undefined | content
`coerceTypes` | boolean| false | enable coerce types feature
`removeAdditional` | boolean | false | enable remove additional properties feature
`errors` | `{ [keywordName: string]: string }` | {} | custom error messages
`warnings` | `{ [keywordName: string]: string }` | {} | custom warning messages
`keywords` | `IKeyword[]` | [] | additional validation keywords
`descriptionResolver` | `(message: ValidationMessage) => string` | `(message) => message.toString()` | function resolving validation message descriptions

See [ValidationMessage](https://github.com/gromver/rjv#validationmessage)

### FormProvider
Creates form and provides a form data.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`children`* | `ReactNode` | undefined | content
`data` | `any` | undefined | the initial form data
`ref` | `React.RefObject<FormApi>` | undefined | returns an object containing the API to work with the form. Also this api can be obtained using the [useForm](#useform--formapi) hook.

### CatchErrors
Provides validation errors context. This component collects errors from all fields enclosed within.

> Note that the `FormProvider` component already provides an `CatchErrors` for the entire form,
> but you are able to wrap some particular fields with `CatchErrors` to get errors only for that fields.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`children`* | `ReactNode` | undefined | content

### ErrorMessages
Passes errors caught by the closest `CatchErrors` component to the render function.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(errors: ValidationErrors) => ReactNode` | undefined | a function rendering errors. See [ValidationErrors](#validationerrors)

### Form
Passes `FormInfo` object to the render function.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(formInfo: FormInfo) => ReactElement` | undefined | a function rendering a form related UI.

#### FormInfo
```typescript
type FormInfo = {
   form: FormApi
   state: FormState
}
```

#### FormApi
```typescript
type FormInfo = {
   // submits form
   submit: (
     onSuccess?: (data: any) => void | Promise<void>,
     onError?: (firstErrorField: FirstErrorField) => void | Promise<void>
   ) => void
   // validates specified field / fields
   validate: (path: types.Path | types.Path[]) => Promise<void>
   // returns data ref to the property
   getDataRef: (path?: types.Path) => types.IRef
   // returns a list of errors catched by the closest CatchErrors component
   getErrors: () => ValidationErrors
}
```

#### FirstErrorField
```typescript
type FirstErrorField = {
   // path of the field where the first error has been acquired
   path: string,
   // focuses the input control if possible
   focus: () => void,
   // input control element if it was provided, 
   // see render function of the Field component
   inputEl?: React.ReactElement
}
```

#### FormState
```typescript
type FormState = {
   isValid: boolean
   isSubmitting: boolean
   submitted: number
   isTouched: boolean
   isDirty: boolean
   isChanged: boolean
}
```

### Field
The `Field` component is responsible for rendering the specific data property.
It takes the render function of the field control and invokes it each time the value or validation/UI state of the data property changed.
The field control render function gets a [fieldInfo](#fieldinfo) object, using this object it is able to handle these issues:
 - Changing value
 - Getting/Setting UI state (pristine/touched/dirty/valid etc)
 - Validating value
 - Rendering the field control with actual validation/UI state

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | `string`| undefined | specifies data property
`schema`* | `Object<JSON Schema>` | undefined | schema is used to validate field
`render`* | `(fieldInfo: FieldInfo) => ReactNode` | undefined | a function rendering the UI of the field. See [FieldInfo](#fieldinfo).

#### FieldInfo
```typescript
type FieldInfo = {
  // the current state of the field
  state: FieldState
  // an API to interact with field
  field: FieldApi
  // a reference to the input component, later this ref can be used to focus an invalid input component 
  inputRef: React.RefObject
}
```

#### FieldApi
```typescript
type FieldApi = {
   // get / set value of the field
   value: any
   // get data ref to the property
   ref: types.IRef
   // normalized message of the FieldState.message
   messageDescription: string | undefined
   // validate field
   validate: () => Promise<types.IValidationResult>
   // focus input element if it was provided
   focus: () => void
   // mark field as dirty
   dirty: () => this
   // mark field as touched
   touched: () => this
   // mark field as pristine
   pristine: () => this
   // mark field as invalidated
   invalidated: () => this
}
```
See [IRef](https://github.com/gromver/rjv#ref), [IValidationResult](https://github.com/gromver/rjv#ivalidationresult)

#### FieldState
```typescript
type FieldState = {
   isValid: boolean
   isValidating: boolean
   isValidated: boolean
   isPristine: boolean
   isTouched: boolean
   isDirty: boolean
   isChanged: boolean
   isRequired: boolean
   isReadonly: boolean
   message?: ValidationMessage
}
```
See [ValidationMessage](https://github.com/gromver/rjv#validationmessage)

### FieldArray
A useful component to deal with an array of fields. It provides an api for adding / removing fields
and also manages the generation of unique keys for each field.

> This component works with arrays of any types - strings, numbers, objects, arrays.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | `string`| undefined | specifies data property
`render`* | `(fieldsInfo: FieldArrayInfo) => React.ReactElement` | undefined | a function rendering fields of the array. See [FieldArrayInfo](#fieldarrayinfo).
`ref` | `React.RefObject<FieldArrayApi>` | undefined | returns an object containing the API to add / remove fields

#### FieldArrayInfo
```typescript
type FieldArrayInfo = {
   items: FieldItem[]
   fields: FieldArrayApi
}
```

#### FieldItem
The description of the field being rendered.
```typescript
type FieldItem = {
  key: string,        // unique key of teh field
  path: types.Path    // the property path of the field
}
```

#### FieldArrayApi
An API for adding / removing fields
```typescript
type FieldArrayApi = {
  // append data to the end of the array
  append: (value: any) => void
  // prepend data to the start of the array
  prepend: (value: any) => void
  // remove data at particular position
  remove: (index: number) => void
  // clear array
  clear: () => void
  // remove data at particular position
  insert: (index: number, value: any) => void
  // swap data items
  swap: (indexA: number, indexB: number) => void
  // move data item to another position
  move: (from: number, to: number) => void
}
```

### Scope
Sets the data scope of the form - all relative paths will be resolved against the nearest scope up the component tree.
> By default `FormProvider` component sets the scope to the root `/` path.

Properties:

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

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(...values: any[]) => ReactNode` | undefined | a function rendering some UI content when changes occur. The render function gets a list of data values for each observed property. > Note: values of props with wildcards `*` or `**` cannot be resolved, they will be undefined
`props` | `Path[]` | [] | a list of properties to watch, each property path can be relative or absolute and contain wildcards `*` or `**`
`debounce` | `number` | 0 ms | debounce re-render,

### Property
Subscribes to a property changes and passes the property value and setter function to the render function.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(value: any, setValue: (value: any) => void) => ReactElement` | undefined | a function rendering a property related UI.

### VisibleWhen
Shows children content when the data is correct

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`schema`* | `Object<JSON Schema>` | undefined | schema used to check data
`useVisibilityStyle`* | `boolean` | false | use css visibility style and do not unmount children components
`visibleStyles`* | `CSSProperties` | undefined | css styles for the visible content
`hiddenStyles`* | `CSSProperties` | undefined | css styles for the hidden content
`path` | `string`| '/' | absolute or relative path to data

## Hooks
 - [useForm](#useform--forminfo)
 - [useFormApi](#useformapi--formapi)
 - [useFormState](#useformstate--formstate)
 - [useField](#usefieldpath-string-schema-ischema--fieldinfo)
 - [useFieldArray](#usefieldarraypath-string--fieldarrayinfo)
 - [useProperty](#usepropertypath-string--any-value-any--void)
 - [useErrors](#useerrors--validationerrors)
 - [useWatch](#usewatchpath-string--any)
 - [usePath](#usepathpath-string--string)
 - [useDateRef](#usedaterefpath-string--iref)
 - [useValidate](#usevalidate--path-string--string--promisevoid)

### `useForm() => FormInfo`
This hook combines `useFormApi` and `useFormState` hooks together and returns a form [info](#forminfo) object.

### `useFormApi() => FormApi`
Returns a form [api](#formapi) object.

### `useFormState() => FormState`
Returns a form [state](#formstate) object.

### `useField(path: string, schema: ISchema) => FieldInfo`
Creates a field with provided schema and returns a field [info](#fieldinfo) object.

### `useFieldArray(path: string) => FieldArrayInfo`
Returns a field array [info](#fieldarrayinfo) object.

### `useProperty(path: string) => [any, (value: any) => void]`
Subscribes to the property changes. Behaves like the `useState` hook.

### `useErrors() => ValidationErrors`
Returns a list of errors caught by [CatchErrors](#catcherrors) component

#### ValidationErrors
```typescript
type ValidationErrors = { path: string, message: string }[]
```

### `useWatch(...path: string[]) => any[]`
Returns an array of values for each observed property. The property path can contain wildcards, but the value of such properties cannot be resolved and will be undefined.

### `usePath(path: string) => string`
If the given path is relative, returns the resolved path against the closest scope, otherwise returns the path as is.

### `useDateRef(path: string) => IRef`
Returns an [IRef](https://github.com/gromver/rjv#ref) api object to get and set the value of the property. The path to the property can be absolute or relative.

### `useValidate() => (path: string | string[]) => Promise<void>`
Returns a function that triggers validation of the desired properties. The path to the properties can be absolute or relative.

## License
**rjv-react** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rjv-react/blob/master/LICENSE
