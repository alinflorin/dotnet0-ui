using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class ProjectDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public ProjectType Type { get; set; }
        public List<FileDto> Files { get; set; }
    }
}
