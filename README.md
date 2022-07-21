# 👩‍🔬 lab.nvim

**Heads up:** *lab.nvim is still very early in development and should be considered beta.*

## Goal
- Provide a collection of unique **prototyping** tools for neovim. 
- These tools should be extremely configurable and modular in nature.

## Features

### Code Runner
- The foundational feature for lab.nvim is a code runner with real-time, inline feedback. (Inspired by [runjs](https://runjs.app/), [quokka](https://quokkajs.com/) and others.)
- The code runner currently supports Javascript, Typescript, Python, and Lua with additional language support planned.
- The goal of the code runner isn't to be a full-fledged debugger, rather it aims to provide a simple rapid feedback mechanism that can be useful while working on protoyping tasks.

[code-runner-demo.webm](https://user-images.githubusercontent.com/106625318/178158478-09f4fc29-7dbe-4d34-a56c-64c9f4ecae54.webm)

#### Commands

| Command | Action |
:---------| :-------
| `Lab code run` | Run or resume the code runner on the current file. |
| `Lab code stop` | Stop the code runner on the current file. |
| `Lab code panel` | Show the code runner info buffer. |
| `Lab code config` | Show the code runner config for the current file. |

Note that the run command is also automatically invoked each time you save changes to a file that is currently active.

## Requirements
- neovim >= 0.7.2
- plenary.nvim
- node >= 16.10.0

## Optional Requirements
- Python 3 (Python code runner)
- Lua 5.4 (Lua code runner)

## Example Setup

**Important:** Notice the post install hook. Lab.nvim has a few internal node dependencies that should be installed. See: [package.json](https://github.com/0x100101/lab.nvim/blob/main/js/package.json#L10)

```
Plug 'nvim-lua/plenary.nvim'
Plug '0x100101/lab.nvim', { 'do': 'cd js && npm ci' }

lua require('lab').setup {}

nnoremap <F4> :Lab code stop<CR>
nnoremap <F5> :Lab code run<CR>
nnoremap <F6> :Lab code panel<CR>
```

## Road Map
- Add tests.
- Expose more configuration options.
- Perf audit.
