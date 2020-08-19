import { configure } from '@storybook/react'

import './styles.css'
import 'antd/dist/antd.css'

const reqs = [
  require.context('../src', true, /\.stories\.ts?x$/),
]

const loadStories = () => reqs.forEach(req => req.keys().forEach(filename => req(filename)))

configure(loadStories, module)
