using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class FileDto
    {
        public string Id { get; set; }
        public string ProjectId {get;set;}
        public string Path { get; set; }
        public FileType Type { get; set; }
        public string Content { get; set; }
        public string TempContent { get; set; }
    }
}
