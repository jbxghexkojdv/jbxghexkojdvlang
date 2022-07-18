try {
import jl from "./interpreterTest.js";//
jl._run("./code.jbxl")
}
catch(err)
{
    console.error(err.stack);
}
