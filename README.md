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
      render={({ handleSubmit }) => <button onClick={handleSubmit}>Sign In</button>}
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
For example, we can create a couple of the higher order components like `Form` and `TextField` for the [Material UI](https://material-ui.com) library.

`components/Form.js`
```typescript jsx
import React, { useCallback } from "react";
import { FormProvider, useFormApi } from "rjv-react";

type FormProps = {
  // initial form data
  data: any;
  // note that onSuccess function could be async
  onSuccess: (data: any) => void | Promise<void>;
  children: React.ReactNode;
  // focus first error field after the form submitting
  focusFirstError?: boolean;
};

function Form(props: FormProps) {
  const { data, onSuccess, focusFirstError = true, ...restProps } = props;
  const { submit } = useFormApi();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      submit(onSuccess, (firstErrorField) => {
        if (focusFirstError) {
          firstErrorField.focus();
        }
      });
    },
    [submit, onSuccess, focusFirstError]
  );

  return <form {...restProps} onSubmit={handleSubmit} noValidate />;
}

export default function FormWithProvider(props: FormProps) {
  return (
    <FormProvider data={props.data}>
      <Form {...props} />
    </FormProvider>
  );
}
``` 

`components/TextField.js`
```typescript jsx
import React from "react";
import { types } from "rjv";
import { useField } from "rjv-react";
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps
} from "@material-ui/core";

export interface TextFieldProps
  extends Omit<
    MuiTextFieldProps,
    "name" | "value" | "onFocus" | "onChange" | "onBlur"
    > {
  // path to the data property
  path: string;
  // validation schema
  schema: types.ISchema;
  // specify when the field should be validated
  validateTrigger?: "onBlur" | "onChange" | "none";
  // remove error when the field's value is being changed
  invalidateOnChange?: boolean;
}

export default function TextField(props: TextFieldProps) {
  const {
    path,
    schema,
    helperText,
    required,
    error,
    children,
    validateTrigger = "onBlur",
    invalidateOnChange = true,
    ...restProps
  } = props;
  const { field, state, inputRef } = useField(path, schema);
  const hasError = error ?? (state.isValidated && !state.isValid);
  const errorDescription = hasError ? field.messageDescription : undefined;

  return (
    <MuiTextField
      {...restProps}
      inputRef={inputRef}
      onFocus={() => field.touched()}
      onChange={(e) => {
        field.dirty().value = e.target.value;

        if (
          invalidateOnChange &&
          validateTrigger !== "onChange" &&
          state.isValidated
        ) {
          field.invalidated();
        }

        if (validateTrigger === "onChange") field.validate();
      }}
      onBlur={() => {
        if (validateTrigger === "onBlur") field.validate();
      }}
      value={field.value}
      required={required ?? state.isRequired}
      error={hasError}
      helperText={errorDescription ?? helperText}
    >
      {children}
    </MuiTextField>
  );
}
``` 
Now the "Sign Up" form might look like:

`components/SignUpForm.js`
```typescript jsx
import React, { useState } from "react";
import { Button } from "@material-ui/core";
import Form from "./Form";
import TextField from "./TextField";

export default function SignUpForm() {
  const [initialData] = useState({})

  return (
    <Form data={initialData} onSuccess={(d) => console.log("Form data:", d)}>
      <div>
        <TextField
          style={fieldStyles}
          path={"email"}
          schema={{ default: "", presence: true, format: "email" }}
          label="Email"
        />
      </div>
      <br />
      <div>
        <TextField
          style={fieldStyles}
          path={"password"}
          schema={{ default: "", presence: true, minLength: 6 }}
          label="Password"
        />
      </div>
      <br />
      <div>
        <TextField
          style={fieldStyles}
          path={"confirmPassword"}
          schema={{
            default: "",
            const: (propRef) => propRef.ref("/password").value,
            error: "Confirm your password"
          }}
          label="Confirm password"
        />
      </div>
      <br />
      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

[Checkout](https://codesandbox.io/s/material-ui-sign-up-form-rhrvd) this example in CodeSandBox

## Components

 - [OptionsProvider](#optionsprovider)
 - [FormProvider](#formprovider)
 - [CatchErrors](#catcherrors)
 - [ErrorMessages](#errormessages)
 - [Form](#form)
 - [FormStateUpdater](#formstateupdater)
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
`coerceTypes` | `boolean` | false | enable coerce types feature
`removeAdditional` | `boolean` | false | enable remove additional properties feature
`validateFirst` | `boolean` | true | stop validating schema keywords on the first error acquired
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
`ref` | `React.RefObject<FormApi>` | undefined | returns an object containing the form [API](#formapi)

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
type FormApi = {
   // submits form
   submit: (
     onSuccess?: (data: any) => void | Promise<void>,
     onError?: (firstErrorField: FirstErrorField) => void | Promise<void>
   ) => void
   // validates form data and sets isValid state of the form
   sync: () => void
   // validates specified field / fields
   validateFields: (path: types.Path | types.Path[]) => Promise<void>
   // same as validateFields,
   // but not affects isValidating and isValidated states of the field
   syncFields: (path: types.Path | types.Path[]) => Promise<void>
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

### FormStateUpdater
Recalculates the `isValid` state of the whole form when data changes.
> Should be used only once per form.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`debounce` | `number` | 300 ms | debounce updates, 0 - without debounce
`dependecies` | `any[]` | [] | any external values (react state / store / etc) that affect validation rules of the form

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
`dependecies` | `any[]` | [] | any values that affect validation schema or are used in the `validate` or `resolveSchema` keywords, when dependencies are changed the field applies a new validation schema and recalculates the `isValid` state
`ref` | `React.RefObject<FieldApi>` | undefined | returns an object containing the field [API](#fieldapi)

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
`render`* | `(submitInfo: SubmitInfo) => ReactNode` | undefined | a function rendering the UI of the submit button, it gets a `SubmitInfo` object containing a `handleSubmit` function which should be called to submit a form.
`onSubmit` | `(data: any) => void` | undefined | a callback function to be called when the form submission process begins
`onSuccess` | `(data: any) => void` | undefined | a callback function to be called after `onSubmit` if the form data is valid
`onError` | `(firstErrorField: FieldApi) => void` | undefined | a callback function to be called after `onSubmit` if the form data is invalid. See [FieldApi](#fieldapi)
`focusFirstError` | boolean | true | if "true" tries to focus first invalid input control after the form submission

#### SubmitInfo
```typescript
type SubmitInfo = {
  handleSubmit: () => void
  form: FormApi
  state: FormState
}
```
See [FormApi](#formapi), [FormState](#formstate)


### Watch
Re-renders content when the certain fields are changed

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(...values: any[]) => ReactNode` | undefined | a function rendering some UI content when changes occur. The render function gets a list of data values for each observed property. > Note: values of props with wildcards `*` or `**` cannot be resolved, they will be undefined
`props` | `Path[]` | [] | a list of properties to watch, each property path can be relative or absolute and contain wildcards `*` or `**`

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
 - [useField](#usefieldpath-string-schema-ischema-dependencies-any--fieldinfo)
 - [useFieldArray](#usefieldarraypath-string--fieldarrayinfo)
 - [useProperty](#usepropertypath-string--any-value-any--void)
 - [useErrors](#useerrors--validationerrors)
 - [useWatch](#usewatchpath-string--any)
 - [usePath](#usepathpath-string--string)
 - [useDateRef](#usedaterefpath-string--iref)
 - [useValidate](#usevalidate--path-string--string--promisevoid)

### `useForm() => FormInfo`
This hook combines `useFormApi` and `useFormState` hooks together and returns a form [info](#forminfo) object.
> This hook is used by [Form](#form) component.

### `useFormApi() => FormApi`
Returns a form [api](#formapi) object.

### `useFormState() => FormState`
Returns a form [state](#formstate) object.

### `useField(path: string, schema: ISchema, dependencies?: any[]) => FieldInfo`
Creates a field with provided schema and returns a field [info](#fieldinfo) object.
> This hook is used by [Field](#field) component.

### `useFieldArray(path: string) => FieldArrayInfo`
Returns a field array [info](#fieldarrayinfo) object.
> This hook is used by [FieldArray](#fieldarray) component.

### `useProperty(path: string) => [any, (value: any) => void]`
Subscribes to the property changes. Behaves like the `useState` hook.

### `useErrors() => ValidationErrors`
Returns a list of errors caught by [CatchErrors](#catcherrors) component
> This hook is used by [ErrorMessages](#errormessages) component.

#### ValidationErrors
```typescript
type ValidationErrors = { path: string, message: string }[]
```

### `useWatch(...path: string[]) => any[]`
Returns an array of values for each observed property. The property path can contain wildcards, but the value of such properties cannot be resolved and will be undefined.
> This hook is used by [Watch](#watch) component.

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
