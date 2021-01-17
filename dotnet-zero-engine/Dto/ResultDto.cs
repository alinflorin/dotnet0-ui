using System.Collections.Generic;

namespace DotnetZero.Engine.Dto
{
    public class ResultDto
    {
        public bool Success {get;set;}
        public IEnumerable<ConsoleMessageDto> ConsoleMessages {get;set;}
    }
}