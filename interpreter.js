function _format(str)
{
    if(typeof str != "string")
    {
        str = str.toString();
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
            if(ln.at(-2) != "as")
            {
                console.log("Expected \"as\" keyword in declaration of variable with value " + value + " and type " + type);
            }
            switch(type)
            {
                case "string":
                    if(value[0] == "\"" && value.at(-1) == "\"")
                    {
                        value = value.slice();
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
                    if(value.match(/\d+/)[0] == value)
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
                case "boolean":
                case "bool":
                    if(value == "true")
                    {
                        value = true;
                    }
                    else if(value == "")
                    {
                        value = false;
                    }
                    else
                    {
                        console.error("Invalid boolean: " + value);
                    }
                    break;
                case "auto":
                    value == JSON.parse(value);
                    break;
                default:
                    // for classes later
            }
            window[name] = value;
        },
        spit(ln)
        {
            let spitstr = "";
            for(let i = 1; i < ln.length; i++)
            {
                if(i == 1 && (ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)))
                {
                    ln[i].replace(/"/, "");
                    spitstr += _format(ln[i]);
                }
                else if(i+1 >= ln.length && (ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)))
                {
                    ln[i].replace(/"$/, "");
                    spitstr += _format(ln[i]);
                }
                else if(i == 1 && !(ln[i][0] == "\"" || ln[i] == "true" || ln[i] == "false" || ln[i].match(/^\d+$/)))
                {
                    spitstr += _format(window[ln[i]]);
                }
                else
                {
                    spitstr += _format(ln[i]);
                }
                spitstr += " ";
            }
            console.log(spitstr);
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
