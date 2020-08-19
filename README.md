# rjv-react

React components for creating forms powered by [Rjv](https://github.com/gromver/rjv) (Reactive JSON Validator)

 - uses the JSON Schema to validate forms
 - customizable validation messages
 - localized messages
 - works in web and native environments
 - suitable for any UI components library

#### Contents
 - [Install](#install)
 - [Guide](#guide)
 - [Components](#components)
 - [Hooks](#hooks)

## Install
```
yarn add lodash rxjs rxjs-compat rjv rjv-react
```

## Guide
 - [Validation](#validation)
 - [Fields](#fields)
 - [Higher-Order Fields (HOF)](#higher-order-fields-hof)
 - [Submitting form](#submitting-form)
 - [Scopes](#scopes)
 - [Default settings](#default-settings)

### Validation
To validate form data you have to use a JSON schema.
JSON schema is a simple object with a set of [keywords](https://github.com/gromver/rjv#keywords) that describe how the data should be validated.
There are two approaches to provide this schema:
 - [Single schema](#single-schema)
 - [Composed schema](#composed-schema)

> Both of these approaches are different and have their pros and cons.

#### Single schema
This approach involves the use of one schema describing the validation rules for the entire form data.
This schema is specified through the `ModelProvider` component, which creates a model connecting form data with a JSON schema.
```jsx
import { ModelProvider, Field, Submit } from 'rjv-react';

const schema = {
  properties: {
    login: { default: '', type: 'string', presence: true, format: 'email' },
    password: { default: '', type: 'string', presence: true },
  }
}

function LoginForm() {
  return <ModelProvider data={{}} schema={schema}>
    <Field
      path="login"
      render={(ref, register) => {
        return <input
          ref={register}
          placeholder="Login"
          value={ref.value}
          onChange={(e) => ref.value = e.target.value}
          onBlur={() => ref.validate()}
        />
      }}
    />
    <Field
      path="password"
      render={(ref, register) => {
        return <input
          ref={register}
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
      render={(handleSubmit) => <button  onClick={handleSubmit}>Sign In</button>}
    />
  </ModelProvider>
}
```
Pros:
 - all rules for the entire form data in one place, the schema is similar to the server-side validation schema
 - using conditional keywords you are able to control the visibility of certain form fields
 - better performance than composed schemas
 - the validation rules and UI are separated - better testing

Cons:
 - harder to start - the more complex the data structure, the more complex the schema will be
 - the validation rules and UI are separated - field validation rules are hidden

#### Composed schema
This is a classic approach where the form UI determines form data validation rules.
To enable composed schema approach you don't have to provide schema at the `ModelProvider` component level, you should provide
schemas at the `Field` component level, which will be composed into a single schema.
```jsx
import { ModelProvider, Field, Submit } from 'rjv-react';

function LoginForm() {
  return <ModelProvider data={{}}>
    <Field
      path="login"
      schema={{
        default: '', type: 'string', presence: true, format: 'email'
      }}
      render={(ref, register) => {
        return <input
          ref={register}
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
      render={(ref, register) => {
        return <input
          ref={register}
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
  </ModelProvider>
}
```
Pros:
 - easier to start - simple flat validation schema for a certain data property
 - UI and validation rules are in one place
 - default approach for most forms

Cons:
 - worse performance than single schema

### Fields
There is a `Field` [component](#field) to connect user interface with data model.
The `Field` component takes the render function of the field control and invokes it each time the value or validation/UI state of the data property changed.
The field control render function gets a [ref](https://github.com/gromver/rjv#ref) to the data property, using this ref it should handle these issues:
 - Changing value
 - Changing UI state (pristine/touched/dirty) if needed
 - Validating value
 - Rendering the field control with actual validation/UI state

```jsx
import { ModelProvider, Field } from 'rjv-react';

function SimpleFieldDemo() {
  return <ModelProvider data={{}}>
    <Field
      path="name"
      schema={{ default: '', type: 'string', presence: true }}
      render={(ref, register) => {
        const classNames = [];
        if (ref.isTouched) classNames.push('touched');
        if (ref.isDirty) classNames.push('dirty');

        return <div>
          <p>Type your name:</p>
          <div className={classNames.join(' ')}>
            <input
              ref={register}  // bind input control to a "name" property
              value={ref.value} // display actual value
              onFocus={() => ref.markAsTouched()} // change UI state
              onChange={(e) => ref.markAsDirty().value = e.target.value} // change value and UI state
              onBlur={() => ref.validate()} // validate value when "onBlur" event occurs
            />
          </div>
          {/* show error if needed */}
          {ref.isInvalid && <p className="error">
            {ref.messageDescription}
          </p>}
        </div>
      }}
    />
  </ModelProvider>
}
```

### Higher-Order Fields (HOF)
As the `rjv-react` library works in any environment (web/native) and with any 3d party UI
components framework, it would be better to create a set of higher-order field components to simplify form development.
Here is an example of how HOF components might look like:

`components/HOF.js`
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

export function InputField (props) {
  return 
    <Field
      path={path}
      schema={schema}
      safe={safe}
      render={(ref, register) => {
        return (
          <div className="field-row">
            <label className="field-label">
              {label}
            </label>
            <div className="field-control">
              <Input
                ref={register}
                value={ref.value}
                onFocus={() => ref.markAsTouched()}
                onChange={(e) => ref.markAsDirty().value = e.target.value}
                onBlur={() => ref.isDirty && validateRef(ref)}
                disabled={ref.isReadOnly}
                placeholder={placeholder}
              />
            </div>
            {ref.isValidated && ref.isInvalid && 
              <div className="field-error">{ref.messageDescription}</div>}
          </div>
        );
      }}
    />
}
``` 
Now a Sign In form might look like:

`components/SignInForm.js`
```jsx
import { ModelProvider, Submit } from 'rjv-react';
import { InputField } from 'HOF.js'

export default function SignInForm() {
  return <ModelProvider data={{}}>
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
    <Submit
      onSuccess={(data) => console.log(data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
    />
  </ModelProvider>
}
```
This is very rough and simple example, in practice HOF components would be more functional and flexible.
> Further, the HOF components will be used to simplify form examples

### Submitting form
There are two ways to submit a form:
 - `Submit` component
 - Using `submit` function

#### `Submit` component
It is the easiest approach. You need to wrap your submit button with the `Submit` component.
```jsx
import { ModelProvider, Submit } from 'rjv-react';
import { InputField } from 'HOF.js'

export default function SignInForm() {
  return <ModelProvider data={{}}>
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
      onSubmit={(model) => console.log('Validating model:', model)}
      onError={(firstErrorRef) => console.log('The rjv.Ref instance of the first error property:', firstErrorRef)}
      onSuccess={(data) => console.log('Data is valid:', data)}
      render={(handleSubmit) => <button onClick={handleSubmit}>Sign In</button>}
      focusFirstError // autofocus first error component
    />
  </ModelProvider>
}
```
#### Using `submit` function
The `submit` function is a simple async function launching the validation process of the entire model,
it returns a data validation result.
```typescript
interface Focusable extends React.ReactElement {
  focus: () => void
}

type SubmitFormFn = () => Promise<{
  // is data valid?
  isValid: boolean
  // the Ref instance of the first error data property
  firstErrorRef?: Ref
  // the ReactElement caused the first error, might be focused
  firstErrorComponent?: Focusable
  // rjv model
  model: Model
}>
```
The `submit` function can be obtained in two ways:
 - get the ref of the `ModelProvider` component
    ```jsx
    import React, { useCallback } from 'react';
    import { ModelProvider, ModelProviderRef } from 'rjv-react';
    import { InputField } from 'HOF.js'
    
    export default function SignInForm() {
      const formRef = useRef<ModelProviderRef>()
    
      const handleSubmit = useCallback(async () => {
        if (formRef.current) {
          const { submit } = formRef.current
    
          const { isValid, firstErrorComponent, model } = await submit()
    
          if (isValid) {
            console.log(model.data)
          } else {
            if (firstErrorComponent && firstErrorComponent.focus) {
              // focus first error control
              firstErrorComponent.focus()
            }
          }
        }
      }, [formRef])
    
      return <ModelProvider ref={formRef} data={{}}>
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
      </ModelProvider>
    }
    ```

 - using `useRjv` hook
    ```jsx
    import React, { useCallback } from 'react';
    import { ModelProvider, useRjv } from 'rjv-react';
    import { InputField } from 'HOF.js'
    
    function SubmitBtn(props) {
      const rjv = useRjv()
    
      const handleSubmit = useCallback(async () => {
        if (rjv) {
          const { submit } = rjv
    
          const { isValid, firstErrorComponent, model } = await submit()
    
          if (isValid) {
            console.log(model.data)
          } else {
            if (firstErrorComponent && firstErrorComponent.focus) {
              // focus first error control
              firstErrorComponent.focus()
            }
          }
        }
      }, [rjv])
    
      return <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          {props.children}
        </button>
    }
    
    export default function SignInForm() {
      return <ModelProvider data={{}}>
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
      </ModelProvider>
    }
    ```

### Scopes
The `Scope` component define the path to the data property against which the nested components will resolve their relative paths.
> By default, the `ModelProvider` component sets scope to the root path `/`.
```jsx
import { ModelProvider, Submit, Scope } from 'rjv-react';
import { InputField } from 'HOF.js'

export default function ProfileForm() {
  return <ModelProvider data={{}}>
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
  </ModelProvider>
}
```

### Default settings
The `OptionsProvider` component allows customizing default `rjv` model [options](https://github.com/gromver/rjv#model-options) in an application.
Typically, `OptionsProvider` is applied once at the top-level of the application, but it can be used in certain parts of the application to provide different default settings.
```typescript jsx
import { types } from 'rjv'
import { OptionsProvider } from 'rjv-react'
import { InputField } from 'HOF.js'

const DEFAULT_MODEL_OPTIONS: types.IModelOptionsPartial = {
  validator: {
    errors: {
      minLength: 'The value must be at least {limit} characters.',
      // customize other error messages...
    }
  },
  debug: true,
}

export default function ProfileForm() {
  return <OptionsProvider options={DEFAULT_MODEL_OPTIONS}>
    {/* the rest of application */}
  </OptionsProvider>
}
```


## Components

 - [OptionsProvider](#optionsprovider)
 - [ModelProvider](#modelprovider)
 - [Field](#field)
 - [Scope](#scope)
 - [Submit](#submit)
 - [Subscribe](#subscribe)

### OptionsProvider
Provides default model options. This options will be deeply merged with
options from the `ModelProvider` component at the moment of the `model` creation.
One of the main purposes of the component is setting up localized validation messages of the application.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`options` | Object\<Model options> | {} | setup model [options](https://github.com/gromver/rjv#model-options)
`children` | React.ReactNode | undefined | content

### ModelProvider
Provides a rjv model context.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`options` | Object\<Model options> | {} | setup model [options](https://github.com/gromver/rjv#model-options)
`model` | Object\<Rjv model> | undefined | provides an rjv model
`schema` | Object\<JSON Schema> | {} | if `model` is not provided a new model will be created using this `schema` and `data`
`data` | any | undefined | in case where a `model` is not provided you should specify initial data, it will be used to create `model` 
`ref` | React.RefObject<Form API> | undefined | returns an object contains an API to work with the form
`children` | React.ReactNode | undefined | content

React.RefObject<Form API>:
```typescript
interface Focusable extends React.ReactElement {
  focus: () => void
}

type ModelProviderRef = {
  submit: () => Promise<{
    isValid: boolean
    firstErrorRef?: Ref
    firstErrorComponent?: Focusable
    model: Model
  }>
  model: () => Model
}
```

### Field
The `Field` component is responsible for rendering a specific data property. It subscribes to the model events and listens any changes of the data property.
When changes occur, it re-renders the UI of the field.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | string | undefined | specifies data property
`render`* | (ref, registerFn) => ReactNode | undefined | a function renders the UI of the field, it gets arguments: `ref` is a [Ref](https://github.com/gromver/rjv#ref) instance of the data property, `register` is a helper function that stores the reference to the input component, later this ref can be used to focus an invalid input component.
`schema` | Object\<JSON Schema> | undefined | schema is used to validate field, only works in forms with [composed schema](#composed schema)
`safe` | boolean | true | renders UI only if the data property has validation rules, also it ensures that the field is already prepared and has an actual validation state

### Scope
Sets the data scope of the form - all relative paths will be resolved against the nearest scope up the component tree.
By default `ModelProvider` component sets the scope to the root `/` path.

Name | Type | Default | Description
--- | :---: | :---: | ---
`path`* | string | undefined | specifies scope
`children` | React.ReactNode | undefined | content

### Submit
Component based form submitting.

Properties:

Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | (handleSubmitFn) => ReactNode | undefined | a function renders the UI of the field, it gets a `handleSubmitFn` function which should be called to submit a form.
`onSubmit` | (model: Model) => void | undefined | a callback function to be called when the form submission process begins
`onSuccess` | (data: any, model: Model) => void | undefined | a callback function to be called after `onSubmit` if the form data is valid
`onError` | (firstError: Ref, model: Model) => void | undefined | a callback function to be called after `onSubmit` if the form data is invalid
`focusFirstError` | boolean | true | if "true" tries to focus first invalid input control after the form submission

### Subscribe
Name | Type | Default | Description
--- | :---: | :---: | ---
`render`* | (...refs: Ref[]) => ReactNode | undefined | a function renders some UI content when changes occur. If the `to` property is specified, the render function gets a list of refs to the props listed here.
`to` | string[] | [] | the list of properties to subscribe to, a property path can be relative or absolute
`mode` | ObserveMode | "any" | the type of events to subscribe to
`debounce` | number | 33 ms | debounce re-render, events of value changing are not debounced

ObserveMode:
```typescript
type ObserveMode =
  'any'                 // subscribe to any event
  | 'field'             // fieldMutation + fieldState events
  | 'fieldMutation'     // value changing events
  | 'fieldState'        // value validation and UI state changing events
  | 'validation'        // validationBefore + validationAfter events
  | 'validationBefore'  // triggered when validation process begins
  | 'validationAfter'   // triggered when validation process ends
```

## Hooks
 - [useRjv](#userjv)

### useRjv
This hook returns the api related to the context of the closest `ModelProvider` component.
```typescript
type UseRjvApi = {
  // see the "Submitting form" section of the guide
  submit: SubmitFormFn
  // rjv model
  model: Model
  // the scope against which relative paths are resolved
  scope: string
  // store refs of control components
  // the path to the data property should be absolute
  getRef: (path: string) => React.ReactElement | undefined
  setRef: (path: string, el: React.ReactElement) => void
  unsetRef: (path: string) => void
}
```

## License
**rjv-react** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rjv-react/blob/master/LICENSE
