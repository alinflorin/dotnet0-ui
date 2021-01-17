using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class MonacoISingleEditOperation
    {
        public MonacoIRange Range { get; set; }
        public string Text { get; set; }
        public bool? ForceMoveMarkers { get; set; }
    }
}
