function _format(str)
{
    if(typeof str != "string")
    {
        str = JSON.stringify(str);
    }

    let r = "";
    let e = false;

    for(let i of str)
    {
        if(i == "$" && !e)
        {
            e = true;
        }
        else if(e)
        {
            switch(i)
            {
                case "c":
                    r += ";";
                    break;
                case "q":
                    r += "\"";
                    break;
                case "n":
                    r += "\n";
                    break;
                case "$":
                    r += "$";
                    break;
                default:
                   r += i;
            }

            e = false;
        }
        else
        {
            r += i;
        }
    }

    return r;///
}

function _parseName(name)
{
    if(typeof name == "string") name = name.split(".");
    for(let i in name) if(name[i].match(/^\d+$/)) name[i] = Number(name[i]);

    let retval = window;
    for(let i = 0; i+1 < name.length; i++) retval = retval[name[i]];

    return [retval, name[name.length-1]];
}

function _access(isSetting, name, value = null)
{
    if(isSetting)
    {
        return _parseName(name)[0][_parseName[1]] = value;
    }
    return _parseName(name)[0][_parseName[1]];
}

function _interpret(code)
{
    const kwobj = {
        store(ln)
        {
            let inStr = false;
            let type = ln[1];
            let name;
            let value = "";
            for(let i = 2; i < ln.length-2; i++)
            {
                value += ln[i] + " ";
            }
            value = value.slice(0, -1);
            if(ln[ln.length-2] != "as")
            {
                console.error("Expected \"as\" keyword in declaration of variable with value " + value + " and type " + type);
            }
            switch(type)
            {
                case "string":
                    if(value[0] == "\"" && value[value.length-1] == "\"")
                    {
                        value = value.slice(1, -1);
                    }
                    else if(value in window)
                    {
                        value = window[value];
                    }
                    else
                    {
                        console.error("Invalid string: " + value);
                    }
                    break;
                case "int":
                case "float":
                case "double":
                case "number":
                    if(value.match(/^\d+$/)[0])
                    {
                        value = Number(value);
                    }
                    else if(value in window)
                    {
                        value = window[value];
                    }
                    else
                    {
                        console.error("Invalid number: ");
                    }
                    break;
                case "boolean":
                case "bool":
                    if(value == "true")
                    {
                        value = true;
                    }
                    else if(value == "false")
                    {
                        value = false;
                    }
                    else
                    {
                        console.error("Invalid boolean: " + value);
                    }
                    break;
                case "array":
                    if((function(){try{JSON.parse(value)}catch{return false;}return true;})())
                    {
                        value = JSON.parse(value);
                    }
                    else if(value in window)
                    {
                        value = window[value];
                    }
                    else
                    {
                        console.error("Invalid array: " + value);
                    }
                    break;
                case "dict":
                case "dictionary":
                    if((function(){try{JSON.parse(value)}catch{return false;}return true;})())
                    {
                        value = JSON.parse(value);
                    }
                    else if(value in window)
                    {
                        value = window[value];
                    }
                    else
                    {
                        console.error("Invalid dictionary: " + value);
                    }
                    break;
                case "elem":
                case "element":
                    switch(ln[2])
                    {
                        case "new":
                            value = document.createElement(ln[2]);
                            if(ln[3] != "as")
                            {
                                window[ln[3]].appendChild(value);
                            }
                            else
                            {
                                document.getElementsByTagName("body")[0].appendChild(value);
                            }
                            break;
                        case "tag":
                        case "tagName":
                            value = document.getElementsByTagName(ln[2])[Number(ln[3])];
                            break;
                        case "id":
                            value = document.getElementById(ln[2]);
                            break;
                    }
                    break;
                case "func":
                case "function":
                    value = (args) => {window["args"] = args; _interpret(_format(value));};
                    break;
                case "auto":
                    value == JSON.parse(value);
                    break;
                default:
                    // for classes later
            }
            name = ln[ln.length-1];
            _access(true, name, value);
        },
        spit(ln)
        {
            let spitstr = "";
            for(let i = 1; i < ln.length; i++)
            {
                if(i == 1 && (ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)))
                {
                    ln[i] = ln[i].slice(1);
                    spitstr += _format(ln[i]);
                }
                else if(i+1 >= ln.length && (ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)))
                {
                    ln[i] = ln[i].slice(0, -1);
                    spitstr += _format(ln[i]);
                }
                else if(i == 1 && !(ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)) && ln[i].split(".")[0] in window)
                {
                    spitstr += _format(_access(false, name));
                }
                else
                {
                    spitstr += _format(ln[i]);
                }
                spitstr += " ";
            }
            console.log(spitstr);
        },
        repeat(ln)
        {
            if(!Number(ln[ln.length-1]) || Number(ln[ln.length-1]) <= 0 || Number(ln[ln.length-1]) % 1 != 0)
            {
                console.error("Expected non-negative, non-zero integer after repeat statement. Got \"" + ln[ln.length-1] + "\".")
            }
            let code = "";
            for(let i = 1; i+1 < ln.length; i++)
            {
                if(i <= 1) ln[i] = ln[i].slice(1);
                if(i >= ln.length-1) ln[i] = ln[i].slice(0, -1);
                code += ln[i] + " ";
            }
            code = _format(code);
            for(let i = 0; i < Number(ln[ln.length-1]); i++)
            {
                _interpret(code);
            }
        },
        call(ln)
        {
            _access(false, ln[1])(ln.slice(2));
        }
    };
    let lines = code.split(";");
    for(let i of lines)
    {
        let words = i.split(/\s/g).filter((value, index, arr) => {return value != "";});
        if(words[0] in kwobj)
        {
            kwobj[words[0]](words);
        }
    }
}

function _run(link)
{
    if(typeof link != 'string') return;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", link);
    xhr.onload = () =>
    {
        _interpret(xhr.responseText);
    };
    xhr.send();
}


export default {_interpret: _interpret, _format: _format, _run: _run};
