using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class ConsoleMessageDto
    {
        public string Message { get; set; }
        public ConsoleMessageType Type { get; set; }
        public int? Line { get; set; }
        public int? Column { get; set; }
        public string FilePath { get; set; }
        public string Code { get; set; }
    }
}
