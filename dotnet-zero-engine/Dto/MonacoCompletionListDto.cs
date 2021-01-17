using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class MonacoCompletionListDto
    {
        public IEnumerable<MonacoCompletionItemDto> Suggestions { get; set; }
        public bool? Incomplete { get; set; }
    }
}
