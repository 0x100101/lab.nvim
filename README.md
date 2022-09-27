# 👩‍🔬 lab.nvim

<br>

:warning: **Heads up:** *lab.nvim is very early in development and is currently in a proof of concept state. Right now lab.nvim is more-or-less stable and usable, but in any case, consider this pre-release beta software.*

## Goal
Provide a collection of unique **prototyping** tools for neovim. These tools should be extremely configurable and modular in nature.

## Features

- [Code Runner](#code-runner)
- [Quick Data](#quick-data)

### <a id="code-runner"></a> ✳️ Code Runner
- The foundational feature for lab.nvim is a code runner with real-time, inline feedback. (Inspired by [runjs](https://runjs.app/), [quokka](https://quokkajs.com/) and others.)
- The code runner currently supports JavaScript, Typescript, Python, and Lua with additional language support planned.
- The goal of the code runner isn't to be a full-fledged debugger, rather it aims to provide a simple rapid feedback mechanism that can be useful while working on prototyping tasks.

[code-runner-demo.mp4](https://user-images.githubusercontent.com/106625318/181047786-ca256229-bafa-471f-a8ca-420068a4de7d.mp4)

#### Commands

| Command            | Action                                                           |
:--------------------| :----------------------------------------------------------------|
| `Lab code run`     | Run or resume the code runner on the current file.               |
| `Lab code stop`    | Stop the code runner on the current file.                        |
| `Lab code panel`   | Show the code runner info buffer.                                |
| `Lab code config`  | Show the code runner config for the current file.                |

**Note**: that the run command is also automatically invoked each time you save changes to a file that is currently active.

#### Languages

| Language           | Supported                                                        |
:--------------------| :----------------------------------------------------------------|
| JS / TS            | console, debugger, error                                         |
| Python             | print, breakpoint, error                                         |
| Lua                | print, error                                                     |

### <a id="quick-data"></a> ✳️ Quick Data
- The quick data feature allows you to quickly insert fake data while prototyping. 
- The implementation works by providing a dynamic snippet source to [nvim-cmp](https://github.com/hrsh7th/nvim-cmp).
- This feature currently supports [fakerjs](https://github.com/faker-js/faker) as a pre-configured data source.

[quick-data-demo.mp4](https://user-images.githubusercontent.com/106625318/180894510-54c108f0-fb73-480e-a00d-b2d9225df836.mp4)

#### Configuration

- Add the source to your nvim-cmp setup:

```lua
sources = cmp.config.sources({
  { name = 'lab.quick_data', keyword_length = 4 }
}, 
```

- This feature is enabled by default but can be disabled:

```lua
require('lab').setup {
  quick_data = {
    enabled = false,
  }
}
```

## Requirements
- neovim >= 0.7.2
- plenary.nvim
- node >= 16.10.0

## Optional Requirements
- Python 3 (Python code runner)
- Lua 5.4 (Lua code runner)
- nvim-cmp (Quick data snippets)

## Example Setup

**Important**: Notice the post install hook. Lab.nvim has a few internal node dependencies that should be installed. See: [package.json](https://github.com/0x100101/lab.nvim/blob/main/js/package.json#L10)

Packer
```lua
return require('packer').startup(function(use)
  use { '0x100101/lab.nvim', run = 'cd js && npm ci', requires = { 'nvim-lua/plenary.nvim' } }
end)
```

Vim Plug
```
Plug 'nvim-lua/plenary.nvim'
Plug '0x100101/lab.nvim', { 'do': 'cd js && npm ci' }
```

Setup options (defualts illustrated below)
```lua
require('lab').setup {
  code_runner = {
    enabled = true,
  },
  quick_data = {
    enabled = true,
  }
}
```

Key Mappings
```
nnoremap <F4> :Lab code stop<CR>
nnoremap <F5> :Lab code run<CR>
nnoremap <F6> :Lab code panel<CR>
```

## 📝 Roadmap

- [ ] Refactor the JavaScript code runner:
  - The code runner is more-or-less ad hoc / proof of concept, and should be re-factored in to 2 or 3 independent systems. Once this is complete the code will be more maintainable and tests can be added.
- [ ] Split out the server from the plugin and break out the server features in to modular, attachable components:
  - Version 1.0 should not be bundled with the node back-end, instead the user should install the back-end and additional components independently, as needed. (similar to language servers).
- [ ] Expand the configuration options to provide for more fine grained control over how everything works.
- [ ] Add a check health system.
- [ ] Investigate what options are available for adding tests to the front-end (neovim plugin)
- [ ] Improve documentation:
    - Add additional documentation regarding esbuild and the interesting features it exposes.