function _format(str)
{
    let r = "";
    let e = false;
    for(let i of str)
    {
    console.log(i);
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
            console.log(r);
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
            for(i in ln)
            {
                if(i != 0)
                {
                    
                }
            }
            window[key] = value;
        },
        spit(ln)
        {
            let spitstr = "";
            for(let i = 1; i < ln.length; i++)
            {
                if(i == 1)
                {
                    ln[i].replace(/"/, "");
                    spitstr += _format(ln[i]);
                }
                else if(i+1 >= ln.length)
                {
                    ln[i].replace(/"$/, "");
                    spitstr = _format(ln[i]);
                }
                else
                {
                    spitstr = _format(ln[i]);
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
