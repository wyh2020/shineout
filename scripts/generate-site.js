const fs = require('fs')
const path = require('path')
const swig = require('swig')
const chokidar = require('chokidar')
const rimraf = require('rimraf')

const pagesPath = path.resolve(__dirname, '../site/pages')
const chunkPath = path.resolve(__dirname, '../site/chunks')
const componentPath = path.resolve(pagesPath, './components')

const componentsCache = {}
let lastComponentText = null

function getGroups() {
  return JSON.parse(fs.readFileSync(path.resolve(componentPath, 'group.json')))
}

function getComment(text, key) {
  const index = text.indexOf(key)
  if (index >= 0) {
    return text.substr(index + key.length).trim()
  }

  return null
}

function getComponentPage(name, file) {
  const pagePath = path.resolve(componentPath, name)

  let page = componentsCache[name]
  if (page && file.indexOf(pagePath) < 0) {
    return page
  }

  page = {
    codes: [],
    examples: [],
    group: '',
    name,
  }

  const componentGroups = getGroups()

  Object.keys(componentGroups).forEach((k) => {
    const g = componentGroups[k]
    if (g[name] !== undefined) {
      page.group = k
      page.cn = g[name]
    }
  })

  fs.readdirSync(pagePath)
    .filter(n => n.indexOf('example-') === 0 || n.indexOf('code-') === 0)
    .forEach((e) => {
      const text = fs.readFileSync(path.resolve(pagePath, e))
      const comment = /(^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/.exec(text)
      const exam = { path: e }

      if (comment) {
        comment[0].split('\n').forEach((t) => {
          const cn = getComment(t, '* cn -')
          const en = getComment(t, '* en -')
          if (cn) exam.cn = cn
          if (en) exam.en = en
        })
      }

      if (e.indexOf('example-') === 0) {
        page.examples.push(exam)
      } else {
        page.codes.push(exam.path.replace('code-', '').replace('.js', ''))
      }
    })

  const template = swig.compileFile(path.resolve(__dirname, './component-page.tpl'))
  const text = template({ ...page })

  if (!componentsCache[name] || text !== componentsCache[name].text) {
    console.log(`write file chunks/Components/${name}.js`)
    fs.writeFileSync(path.resolve(chunkPath, './Components', `${name}.js`), text)
    page.text = text
  }

  componentsCache[name] = page

  return page
}

function generateComponents(file = '') {
  const template = swig.compileFile(path.resolve(__dirname, './components.tpl'))
  const componentGroups = getGroups()

  const groups = {}
  Object.keys(componentGroups).forEach((key) => {
    groups[key] = []
  })

  fs.readdirSync(componentPath).forEach((dirName) => {
    const state = fs.lstatSync(`${componentPath}/${dirName}`)
    if (state.isDirectory()) {
      const page = getComponentPage(dirName, file)
      if (page) {
        groups[page.group].push(page)
      }
    }
  })

  const text = template({ groups })

  if (lastComponentText !== text) {
    console.log('write file chunks/Components/index.js')
    fs.writeFile(path.resolve(chunkPath, './Components/index.js'), text, (err) => {
      if (err) console.log(err)
    })
    lastComponentText = text
  }
}

function init() {
  const cp = path.resolve(chunkPath, './Components')

  if (fs.existsSync(cp)) {
    rimraf.sync(cp)
  }
  fs.mkdirSync(cp)

  generateComponents()

  console.log('watch site/pages')

  chokidar.watch(componentPath, { ignored: /index\.js$/, ignoreInitial: true })
    .on('all', (e, p) => {
      generateComponents(p)
    })
}

module.exports = {
  init,
}

init()
