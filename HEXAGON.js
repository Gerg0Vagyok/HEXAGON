/*

so something like this in js


[
{thing},
[{thing2}, {thing3}],
{thing4},
]


*/

class HEXAGON {
    static #SeperateLines(Code) {
        // regex contants
        const RegexIsNotEmpty = /[a-zA-Z0-9~`!@#$%^&*()_\-+={[}\]|\\:;"'<,>.?/]/;
        const RegexIsNotForEmpty = /[a-zA-Z0-9~`!@#$%^&*_\-+={[}\]|\\:;"'<,>.?/]/;

        const CodeArr = (Code+" ").split("");
        let CodeObjRaw = [];

        const PushNewEl = () => {if (RegexIsNotEmpty.test(EL) || EL === " " || InDString || InSString || InBString) {CodePartString += EL; IsCodePartStringNotEmpty = RegexIsNotEmpty.test(CodePartString);}}
        const NotComment = () => !(SinlgeLineComment || MultiLineComment);
        const NotString = () => !(InDString || InBString || InSString);
        const NotStringAndComment = () => NotComment() && NotString();
        const CheckChar = (i, n, char) => CodeArr[i+n] !== undefined && CodeArr[i+n] === char;
        const CleanStr = (str) => str.trim().replace(/^[\s\n]+/, "");

        let CodePartString = "";
        let SinlgeLineComment = false;
        let MultiLineComment = false;
        let InForLoopDepth = -1;
        let IsCodePartStringNotEmpty = true;
        let InDString = false;
        let InSString = false;
        let InBString = false;
        let EL = "";
        let LineHasString = false;
        let CodeBlockDepth = 0;
        let CodeBlockPath = [];
        //also commented out, read later comment
        for (let i = 0; i < CodeArr.length; i++) { // Get code to the lines. NVM its also getting other stuff to ckeck if its in {} or in "for ()"
            EL = CodeArr[i];
            // It works but i dont wanna fully implement it yet. its complex but i have to cuz of ; and comments

            if (EL === '"' && NotComment() && InDString && !InSString && !InBString) {
                InDString = false;
                PushNewEl()
            } else if (EL === "'" && NotComment() && InSString && !InDString && !InBString) {
                InSString = false;
                PushNewEl()
            } else if (EL === "`" && NotComment() && InBString && !InDString && !InSString) {
                InBString = false;
                PushNewEl()
            } else if (EL === "*" && CheckChar(i, 1, "/") && MultiLineComment) {
                MultiLineComment = false;
                i += 1;
                // Stop multiline comment
            } else if (EL === "/" && CheckChar(i, 1, "/") && NotString()) {
                SinlgeLineComment = true;
                i += 1;
                // One line comment
            } else if (EL === "/" && CheckChar(i, 1, "*") && !MultiLineComment && NotString()) {
                MultiLineComment = true;
                i += 1;
                // Start multiline comment
            } else if (EL === '"' && NotStringAndComment()) {
                InDString = true;
                LineHasString = true;
                PushNewEl()
            } else if (EL === "'" && NotStringAndComment()) {
                InSString = true;
                LineHasString = true;
                PushNewEl()
            } else if (EL === "`" && NotStringAndComment()) {
                InBString = true;
                LineHasString = true;
                PushNewEl()
            } else if (NotStringAndComment()) {
                // Do stuff here cuz this is stuff that isnt in comments

                if (EL === "{") {
                    CodeBlockDepth++;
                    PushNewEl();
                    if (CodeBlockDepth === 1) {
                        CodeBlockPath.push(CodeObjRaw.length);
                        CodeObjRaw.push({Start: CodePartString.trim(), End: "", Middle: []})
                        CodePartString = "";
                    } else {
                        let obj;
                        for (let j = 0; j < CodeBlockDepth - 1; j++) {
                            if (j === 0) {
                                obj = CodeObjRaw[CodeBlockPath[0]]
                            } else {
                                obj = obj.Middle[CodeBlockPath[j]]
                            }
                        }
                        if (obj !== undefined && obj.Middle !== undefined) {
                            //CodeBlockPath.push(obj.Middle.length);
                            obj.Middle.push({Start: CodePartString.trim(), End: "", Middle: []})
                            CodePartString = "";
                            CodeBlockPath.push(obj.Middle.length-1);
                        }
                    }
                } else if (EL === "}") {
                    CodeBlockDepth--;
                    if (CodeBlockDepth === 0) {
                        CodeObjRaw[CodeBlockPath[0]].Middle.push(CodePartString.trim());
                        CodeObjRaw[CodeBlockPath[0]].End = "}";
                        CodeBlockPath = [];
                        CodePartString = "";
                    } else {
                        let obj;
                        for (let j = 0; j < CodeBlockDepth + 1; j++) {
                            if (j === 0) {
                                obj = CodeObjRaw[CodeBlockPath[0]]
                            } else {
                                obj = obj.Middle[CodeBlockPath[j]]
                            }
                        }
                        if (obj !== undefined && obj.Middle !== undefined) {
                            obj.Middle.push(CodePartString.trim());
                            obj.End = "}";
                            CodePartString = "";
                            CodeBlockPath.pop();
                        }
                    }
                    LineHasString = false;
                } else if (EL === "(" && InForLoopDepth !== -1) {
                    InForLoopDepth++;
                    PushNewEl()
                } else if (EL === ")" && InForLoopDepth !== -1) {
                    InForLoopDepth--;
                    PushNewEl()
                } else if (IsCodePartStringNotEmpty&& EL === "f" && CheckChar(i, 1, "o") && CheckChar(i, 2, "r") && CodeArr[i+3] !== undefined  && !RegexIsNotForEmpty.test(CodeArr[i+3])) {
                    InForLoopDepth = 0;
                    CodePartString += EL;
                    CodePartString += CodeArr[i+1];
                    CodePartString += CodeArr[i+2];
                    IsCodePartStringNotEmpty = RegexIsNotEmpty.test(CodePartString);
                    i += 2;
                } else if (EL === ";" || i === CodeArr.length - 1) {
                    if (InForLoopDepth <= 0) {
                        IsCodePartStringNotEmpty = RegexIsNotEmpty.test(CodePartString);
                        if (IsCodePartStringNotEmpty) {
                            LineHasString = false;
                            if (CodeBlockDepth === 0) {
                                CodeObjRaw.push(CodePartString.trim());
                            } else {
                                let obj;
                                for (let j = 0; j < CodeBlockDepth; j++) {
                                    if (j === 0) {
                                        obj = CodeObjRaw[CodeBlockPath[0]]
                                    } else {
                                        obj = obj.Middle[CodeBlockPath[j]]
                                    }
                                }
                                if (obj !== undefined && obj.Middle !== undefined) {
                                    obj.Middle.push(CodePartString.trim());
                                }
                                
                            }
                        }
                        InForLoopDepth = -1;
                        CodePartString = "";
                    } else {
                        PushNewEl()
                    }
                } else {
                    PushNewEl()
                }
            } else if (NotComment()) {
                PushNewEl()
            } else if (EL === "\n") {
                if (InDString || InBString || InSString) {
                    PushNewEl();
                }
                SinlgeLineComment = false;
                //InDString = false;
                //InSString = false;
                //if (!InBString) {   
                //    LineHasString = false;
                //}
            } else if (i === CodeArr.length - 1) {
                IsCodePartStringNotEmpty = RegexIsNotEmpty.test(CodePartString);
                if (IsCodePartStringNotEmpty) {
                    LineHasString = false;
                    CodeObjRaw.push(CodePartString);
                }
            } else {
                //console.log(i + ": " + EL)
            }
            
        }

        return CodeObjRaw;
    }

    static #ReGroupMath(MathObj) {
        let DoubleGrouped = MathObj;

        let Order = {
            "+": 1,
            "-": 1,
            "*": 2,
            "/": 2,
        };

        function descend(obj, path = [], length = []) {
            //console.log(path);
            if (!obj || !obj.Values /*|| obj.Values.length < 2*/) return;
            for (let i = 0; i < obj.Values.length; i++) {
                const val = obj.Values[i];
                if (val && val.Values) {
                    console.log([...path, i]);
                    console.log([...length, obj.Values.length]);
                    if (obj.Values.length > 2) {
                        console.log("This group has more than 2 values, consider restructuring.");
                        console.log(obj.Operation)
                        for (let j = 0; j < obj.Operation.length && obj.Operation.length > 1; j++) {
                            const TwoElements = obj.Values.slice(j, j+2);
                            //obj.Values.splice(j, j+2);
                            obj.Values.splice(j, 2);
                            obj.Values.unshift({Values: TwoElements, Operation: obj.Operation[j]});// fix this????
                            obj.Operation.shift();
                            //i--;
                            console.log(obj)
                        }
                    }
                    descend(obj.Values[i], [...path, i], [...length, obj.Values.length]);
                }
            }
        }

        let ActuallyGrouped = DoubleGrouped;
        descend(ActuallyGrouped)
        while (JSON.stringify(ActuallyGrouped) !== JSON.stringify(DoubleGrouped)) {
            DoubleGrouped = ActuallyGrouped;
            descend(ActuallyGrouped);
        }
        return ActuallyGrouped;
    }
    
    static MathParser(MathExpressionString) {
        /*
            {
                Operation: {+, -, *, /, etc.}.
                Values: [{
                    Type: {Number, variable, function, Expression}
                    Value: Name of var or value of number or name of function
                    Params: if its a function it has these.
                }]
            }
        */ // This can be nested.

        

        const MathCharArr = (MathExpressionString+" ").split("");
        const IsFloat = (char) => char == parseFloat(char);
        
        let Expression = {Values: []}
        let NestDepth = 0;
        let NestPath = [];
        let CurrentNestObj = Expression;
        let ElNotNumber = false;
        for (let i = 0; i < MathCharArr.length; i++) {
            const el = MathCharArr[i];

            CurrentNestObj = Expression;
            for (let j = 0; j < NestPath.length; j++) {
                if (!CurrentNestObj.Values[NestPath[j]]) {
                    CurrentNestObj.Values[NestPath[j]] = { Values: [] };
                }
                CurrentNestObj = CurrentNestObj.Values[NestPath[j]];
            }

            if (el === "(") {
                if (MathCharArr[i-1] && !/^[\s\t+-/*]*$/.test(MathCharArr[i-1])) {
                    console.log("Itsafunction")
                } else {
                    NestDepth++;
                    if (NestDepth === 1) {
                        NestPath.push(CurrentNestObj.Values.length);
                        //NestPath.push(CurrentNestObj.length);
                    } else {
                        CurrentNestObj.Values.push({ Values: [] });
                        NestPath.push(CurrentNestObj.Values.length - 1);
                    }
                }
            } else if (el === ")") {
                NestPath.pop();
            } else if (el === "+" || el === "-" || el === "*" || el === "/") {
                if (!CurrentNestObj.Operation) {
                    CurrentNestObj.Operation = [el]
                } else {
                    CurrentNestObj.Operation.push(el);
                }
            } else if (IsFloat(el) || MathCharArr[i] === ".") {
                ElNotNumber = true;
                let numstr = "";
                for (let j = i; j < MathCharArr.length && ElNotNumber; j++) {
                    if (!IsFloat(MathCharArr[j]) && MathCharArr[j] !== ".") {
                        ElNotNumber = false;
                        i = j-1;
                    } else if (IsFloat(MathCharArr[j]) || MathCharArr[j] === ".") {
                        numstr+=MathCharArr[j];
                    }
                }

                CurrentNestObj.Values.push({Type: "Number", Value: parseFloat(numstr)});
            }
        }
        console.log(Expression);

        const ReGrouped = this.#ReGroupMath(Expression);

        //console.log(ReGrouped);

        return ReGrouped;
    }

    static #Objectify(CodeLines, SpecialType = 0) { // SpecialType 0 = regular, 1 = class declaration
        let CodeObj = [];

        // Object structure:
        /*
        {
            Type: [functioncall, functiondeclaration, variable, other],
            Name: the name of the thing if there is, like variable name, function name.
            Data: [
                Stuff based on the type, for functioncall the parameters passed, or the parameters it has for functiondeclaration.
                Or the value of the variable. this also includes the array for other stuff for the code, like codeblock: []
            ]
        }
        */

        const VarPrefixes = ["const", "let", "var"];
        const FunctionPrefixes = ["fn", "function"];
        const IfPrefixes = ["if"];

        let el;
        for (let i = 0; i < CodeLines.length; i++) {
            let el = CodeLines[i];
            if (typeof el !== "object") {
                // Its regular text
                let NewObj = {Data: {}};
                const PrefixCheck = el.match(/^(const|let|var)([^=]*)/);
                if (PrefixCheck) {
                    if (VarPrefixes.includes(PrefixCheck[1]) && /*/^[^=]+=\s*([^\s\n=][^=]*(?:={2,}[^=]*)*)$/.test(el)*/ /^[^=]+=\s*(?:(["'`])(?:\\.|(?!\1).)*\1|[^='"]+|==+)*$/.test(el)) {
                        NewObj.Type = "VarDeclare";
                        NewObj.Name = PrefixCheck[2].trim();
                        NewObj.Data.DeclareType = PrefixCheck[1];
                        NewObj.Data.Value = el.split("=").slice(1).join("=").trim();
                    }
                }

                CodeObj.push(NewObj);
            } else {
                // Its a object
                let NewObj = {Data: {}};
                const PrefixCheck = el.Start.match(/^(fn|function|if)([^=]*)/);
                if (PrefixCheck) {
                    if (FunctionPrefixes.includes(PrefixCheck[1])) {
                        NewObj.Type = "FnDeclare";
                        NewObj.Name = PrefixCheck[2].trim().match(/^[^(]+/)[0].trim();
                        NewObj.Data.Params = [];
                        if (el.Start.match(/\(([^)]*)\)/)[1]) el.Start.match(/\(([^)]*)\)/)[1].split(",").forEach((el, i) => NewObj.Data.Params.push(el.trim()));
                        //el.Middle = el.Middle.filter(fel => fel !== "");
                        NewObj.Data.FunctionCode = HEXAGON.#Objectify(el.Middle);
                        console.log(el.Middle);
                        console.log(HEXAGON.#Objectify(el.Middle));
                    } else if (IfPrefixes.includes(PrefixCheck[1])) {
                        NewObj.Type = "IfDeclare";
                        if (el.Start.match(/\(([\s\S]*)\)/)[1]) NewObj.Data.Condition = el.Start.match(/\(([\s\S]*)\)/)[1].trim();
                        //el.Middle = el.Middle.filter(fel => fel !== "");
                        NewObj.Data.IfCode = HEXAGON.#Objectify(el.Middle)
                        console.log(el.Middle);
                        console.log(HEXAGON.#Objectify(el.Middle));
                    }
                } else {
                    console.log("el.Middle")
                    console.log(el.Middle)
                }

                CodeObj.push(NewObj);
            }
        }

        return CodeObj;
    }

    static ExecuteString(CodeString) {
        const LinesSeperated = this.#SeperateLines(CodeString);
        LinesSeperated.forEach((el, i) => console.log(i + ": " + el))
        console.log(LinesSeperated)
        const CodeObject = this.#Objectify(LinesSeperated);

        return CodeObject; // create obejcty that has the error and stuff if there is any.
    }
}

const TestCode = `
//c single line comment(should be ignored);
/* mutli line comment(should be ignored)
asdasd;
*/
/*
// sadasd*/ dsadsa;
// /* ;asdasd
*/ dsa; // asd

for (;;) {
} ;
asd for (;;) {};

for asd (;;);
forasd (;;);

asd="asd";

asd="asd
";

asd='asd';

asd='asd

';

asd=\`asd\`;

asd=\`asd
\`;



"string with new\nline and /* comment */ and // comment" ;
/* comment with "string" inside */ console.log("hello");
// comment with "string" and /* multi-line */ inside

{
{
dsa

}
asd
{

asd
}
}


`;

const TestCode2 = `1
{2
{3
4

}
5
{
6

}7
}
`

const TestCode3 = `
const testvar = 5;
const testvar2 = Testvar + 4;
let testvar3 = "asdasd="=="asd"=;
function asd(asd, asddsa) {
    const asd = "asd";
    function asd(asd, asddsa) {
        const asd = "asd";
    };
    function asd(asd, asddsa) {
        function asd(asd, asddsa) {
            const asd = "asd";
        };
        function asd(asd, asddsa) {
            const asd = "asd";
        };
    };
};

if (false) {
    const logstuff = asd;
}
`


//a = HEXAGON.ExecuteString(TestCode3)
const TestExp = "1.6*(14.12+1.6*(14.12+1)*(1.6*(14.12+1-12)+12+1))";
const a = HEXAGON.MathParser(TestExp);
//a.forEach((el, i) => console.log(i + ": " + el))
console.log(a)
console.log(JSON.stringify(a, null, 2));
//console.log('"`')
//console.log(`" ' `)
//console.log('"`')
// I will have to deal with sanitization later but thats for the engine, not the language


// I guess executestring will return a ast or smthng like that, wait no it returns a value based on if it sucseeded. it runs ExecuteAST or smthng to execute the ast, or smthng like that.
/*

asdasd

asd // asd*/
/// asd