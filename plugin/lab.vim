if exists("g:loaded_lab")
    finish
endif

let g:loaded_lab = 1

function s:labcommand(...)
	if a:1 == "code" && a:2 == 'run'
		lua require("lab.code_runner").run()
	endif
	if a:1 == "code" && a:2 == 'stop'
		lua require("lab.code_runner").stop()
	endif
	if a:1 == "code" && a:2 == 'panel'
		lua require("lab.code_runner").panel()
	endif
	if a:1 == "code" && a:2 == 'config'
		lua require("lab.code_runner").config()
	endif
endfunction

command! -nargs=+ Lab call s:labcommand(<f-args>)
