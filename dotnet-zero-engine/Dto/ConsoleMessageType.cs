using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public enum ConsoleMessageType
    {
        Hidden = 0,
        //
        // Summary:
        //     Information that does not indicate a problem (i.e. not prescriptive).
        Info = 1,
        //
        // Summary:
        //     Something suspicious but allowed.
        Warning = 2,
        //
        // Summary:
        //     Something not allowed by the rules of the language or other authority.
        Error = 3
    }
}
