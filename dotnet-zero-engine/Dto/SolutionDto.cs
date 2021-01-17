using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class SolutionDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<ProjectDto> Projects { get; set; }
    }
}
