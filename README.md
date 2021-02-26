# rjv-react

React components for creating forms powered by [Rjv](https://github.com/gromver/rjv) (Reactive JSON Validator)

 - works with any type of data
 - uses the JSON Schema to validate data
 - customizable validation messages
 - supports message localization
 - works in web and native environments
 - suitable for any UI components library

#### Contents
 - [Install](#install)
 - [Overview](#overview)
 - [Guide](#guide)
 - [3rd Party Bindings](#3rd-party-bindings)
 - [Examples](#examples)
 - [API](#api)
 - [Components](#components)
 - [Hooks](#hooks)

## Install
```
yarn add rjv rjv-react
```

## Overview
This library is a set of components for creating simple or complex forms in React JS applications.
It uses the [Rjv](https://github.com/gromver/rjv) JSON validator,
which provides simplified standard JSON schema [keywords](https://github.com/gromver/rjv#keywords) adopted for the front-end needs,
as well as some additional keywords like `validate` or `resolveSchema` that allow you to create validation rules at runtime.

## Guide
 - [Sign up form](#sign-up-form)
 - [Higher-Order Fields (HOF)](#higher-order-fields-hof)

### Sign up form
This example shows how to create a user registration form using the [Material UI](https://material-ui.com) component library.
> The `rjv-react` can be used with any component libraries, the `Material UI` library is selected for example only.

```typescript jsx
import React, { useState } from "react";
import { Button, TextField } from "@material-ui/core";
import { FormProvider, Field, Submit, Watch } from "rjv-react";

export default function SignUpForm() {
  const [initialData] = useState({});

  return (
    <div className="sign-up-form">
      <h3>Sign Up Form</h3>

      {/* create form and provide initial data */}
      <FormProvider data={initialData}>
        {/* create a field and attach validation rules for the "email" property */}
        <Field
          path={"email"}
          schema={{ default: "", presence: true, format: "email" }}
          render={({ field, state, inputRef }) => {
            const hasError = state.isValidated && !state.isValid;
            const errorDescription = hasError
              ? field.messageDescription
              : undefined;

            return (
              <TextField
                inputRef={inputRef}
                label="Email"
                onChange={(e) => {
                  field.value = e.target.value;
                }}
                onBlur={() => field.validate()}
                value={field.value}
                required={state.isRequired}
                helperText={errorDescription}
                error={hasError}
              />
            );
          }}
        />

        {/* create a field and attach validation rules for the "password" property */}
        <Field
          path={"password"}
          schema={{ default: "", presence: true, minLength: 6 }}
          render={({ field, state, inputRef }) => {
            const hasError = state.isValidated && !state.isValid;
            const errorDescription = hasError
              ? field.messageDescription
              : undefined;

            return (
              <TextField
                inputRef={inputRef}
                label="Password"
                onChange={(e) => {
                  field.value = e.target.value;
                }}
                onBlur={() => field.validate()}
                value={field.value}
                required={state.isRequired}
                helperText={errorDescription}
                error={hasError}
                type="password"
              />
            );
          }}
        />

        {/* watch for changes in the "password" field */}
        <Watch
          props={["password"]}
          render={(password: string) => {
            // create a field and attach validation rules for the "confirmPassword" property
            return (
              <Field
                path={"confirmPassword"}
                schema={{
                  default: "",
                  presence: !!password,
                  const: password,
                  error: "Confirm your password"
                }}
                // notice that the validation rules above depends on the "password" field value
                dependencies={[password]}
                render={({ field, state, inputRef }) => {
                  const hasError = state.isValidated && !state.isValid;
                  const errorDescription = hasError
                    ? field.messageDescription
                    : undefined;

                  return (
                    <TextField
                      inputRef={inputRef}
                      label="Confirm password"
                      onChange={(e) => {
                        field.value = e.target.value;
                      }}
                      onBlur={() => field.validate()}
                      value={field.value}
                      required={state.isRequired}
                      helperText={errorDescription}
                      error={hasError}
                      type="password"
                    />
                  );
                }}
              />
            )
          }}
        />

        {/* Submit form */}
        <Submit
          onSuccess={(data) => console.log("Form data:", data)}
          render={({ handleSubmit }) => (
            <Button onClick={handleSubmit}>Submit</Button>
          )}
        />
      </FormProvider>
    </div>
  );
}
```

[Checkout](https://codesandbox.io/s/material-ui-sign-up-form-raw-lvscg) this example in CodeSandBox

### Higher-Order Fields (HOF)
As the `rjv-react` library works in any environment (web/native) and with any 3d party UI
components framework, it would be better to create a set of higher-order field components to simplify form development.
For example, we can create a couple of [higher order components](https://reactjs.org/docs/higher-order-components.html) such as `Form` and `TextField` that combines the `rjv-react` and `Material UI` components together.

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
import { Watch } from "rjv-react";
import Form from "./Form";
import TextField from "./TextField";

export default function SignUpForm() {
  const [initialData] = useState({})

  return (
    <Form data={initialData} onSuccess={(data) => console.log("Form data:", data)}>
      <TextField
        style={fieldStyles}
        path={"email"}
        schema={{ default: "", presence: true, format: "email" }}
        label="Email"
      />

      <TextField
        path={"password"}
        schema={{ default: "", presence: true, minLength: 6 }}
        label="Password"
        type="password"
      />
      <Watch
        props={["password"]}
        render={(password: string) => (
          <TextField
            style={fieldStyles}
            path={"confirmPassword"}
            schema={{
              default: "",
              presence: !!password,
              const: password,
              error: "Confirm your password"
            }}
            dependencies={[password]}
            label="Confirm password"
            type="password"
          />
        )}
      />

      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

[Checkout](https://codesandbox.io/s/material-ui-sign-up-form-rhrvd) this example in CodeSandBox

## 3rd Party Bindings
 - [Ant Design](https://github.com/gromver/rjv-react-antd)

## Examples
 - [Conditional form](https://codesandbox.io/s/antd-conditional-form-olmcu)
 - [Dynamic items form](https://codesandbox.io/s/antd-dynamic-items-form-jbs23)
 - [Nested form](https://codesandbox.io/s/antd-nested-form-0d3sp)
 - [Multi-step form](https://codesandbox.io/s/antd-multi-step-form-1gysb)
 - [Reset form data and state](https://codesandbox.io/s/antd-reset-form-n8odo)
 - [Inline validation](https://codesandbox.io/s/antd-inline-validation-form-k20f7)
 - [Customize error messages](https://codesandbox.io/s/antd-custom-errors-form-4lgoj)
 - [Multi-language form](https://codesandbox.io/s/antd-multi-language-form-4q1pu)

## API

 - [FormProvider](#formprovider) - create a form.
 - [Field](#field) / [useField](#usefieldpath-string-schema-ischema-dependencies-any--fieldinfo) - create a field with some validation rules and get access to the [state](#fieldstate) and [API](#fieldapi) objects of the field.
 - [FieldArray](#fieldarray) / [useFieldArray](#usefieldarraypath-string--fieldarrayinfo) - render the list and get the [API](#fieldarrayapi) to work with it.
 - [Form](#form) / [useForm](#useform--forminfo) - get access to the [state](#formstate) and [API](#formapi) objects of the form.
 - [FormStateUpdater](#formstateupdater) - update the `isValid` state of the form when data changes
 - [OptionsProvider](#optionsprovider) - setup default form options like error messages, intl, validation options
 - [Watch](#watch) / [useWatch](#usewatchpath-string--any) - watch for property / properties change
 - [Property](#property) / [useProperty](#usepropertypath-string--any-value-any--void) - watch for the particular property change and get the API to change that value
 - [Scope](#scope) - change the scope against which the relative paths are resolved
 - [VisibleWhen](#visiblewhen) - show some content when the provided schema is valid
 - [Submit](#submit) - submit form and get access to the state and api objects of the form 
 - [ErrorMessages](#errormessages) / [useErrors](#useerrors--validationerrors) - get error messages

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
Creates a form and provides initial form data.
There are some tips to notice:
 - The initial data can be of any type, so it doesn't necessarily have to be objects.
 - When your initial data is changed, the state of the form is reset, so you have to memoize your initial data objects or arrays to control the form resetting.
 - `FormProvider` doesn't affect the provided data, it uses the cloned instance.
 - `FormProvider` can be nested.

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
`path`* | `string`| undefined | [path](#path) to the data property
`schema`* | `Object<JSON Schema>` | undefined | JSON schema is used to validate data property
`render`* | `(fieldInfo: FieldInfo) => ReactNode` | undefined | a function rendering the UI of the field. See [FieldInfo](#fieldinfo).
`dependecies` | `any[]` | [] | any values that affect validation schema or are used in the `validate` or `resolveSchema` keywords, when dependencies are changed the field applies a new validation schema and recalculates the `isValid` state
`ref` | `React.RefObject<FieldApi>` | undefined | returns an object containing the field [API](#fieldapi)

#### Path
The `rjv-react` uses a path to point to a specific data property.
Path is a simple string working like a file system path, 
it can be absolute - `/a/b/c` or relative - `../b/c`, `b/c`.
The numeric parts of the path are treated as an array index, the rest as an object key.
By default, all relative paths are resolved against the root path `/`.
The [Scope](#scope) component can be used to change the resolving path.
```typescript
type Path = string
```

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

> Note that you can create multiple fields for the same data property, and these fields will act independently

### FieldArray
A useful component to deal with an array of fields. It provides an api for adding / removing fields
and also manages the generation of unique keys for each field.

> This component works with arrays of any types - strings, numbers, booleans, objects, arrays.
> As a consequence of the above, this component doesn't need to store generated unique keys in the form data.

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
> By default `FormProvider` component sets the root `/` scope.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | string | undefined | specifies scope

### Submit
The component based form submitting.

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
Subscribes to a property changes and passes the property value and value setter function to the render function.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | `(value: any, setValue: (value: any) => void) => ReactElement` | undefined | a function rendering a property related UI.

### VisibleWhen
Shows children content when the data is correct

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`schema`* | `Object<JSON Schema>` | undefined | schema used to check data property
`path` | `string`| '/' | absolute or relative path to data property
`useVisibilityStyle` | `boolean` | false | use css visibility style and do not unmount children components
`visibleStyles` | `CSSProperties` | undefined | css styles for the visible content
`hiddenStyles` | `CSSProperties` | undefined | css styles for the hidden content

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
