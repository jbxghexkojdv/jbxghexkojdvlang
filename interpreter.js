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
