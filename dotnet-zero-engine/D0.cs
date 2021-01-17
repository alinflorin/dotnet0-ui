using DotnetZero.Engine.Dto;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Text;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DotnetZero.Engine
{
    public class D0
    {
        private static readonly Lazy<D0> _lazyDZ = new Lazy<D0>(() => new D0());
        private string _solutionName;
        private ConfigDto _config;
        public static D0 Instance
        {
            get
            {
                return _lazyDZ.Value;
            }
        }

        private AdhocWorkspace _workspace;
        private CSharpCompilation _compilation;
        private byte[] _peBytes;
        private byte[] _pdbBytes;
        private List<MetadataReference> _coreReferences;

        private D0()
        {
        }

        public async Task<SolutionDto> InitSolution(string name)
        {
            await Preload();
            _workspace = new AdhocWorkspace();
            _workspace.ClearSolution();
            _solutionName = name;
            _workspace.AddSolution(SolutionInfo.Create(SolutionId.CreateNewId(), VersionStamp.Create(DateTime.UtcNow), $"{name}.sln"));
            var project = AddProject(new ProjectDto
            {
                Name = name
            });
            AddFile(project.Id, new FileDto
            {
                Path = "Program.cs",
                Content =
      @"using System;
namespace MyProject {
    public class Program {
        public static void Main(string[] args) {
            Console.WriteLine(""test"");
        }
    }
}
",
                Type = FileType.CSharp
            });
            AddFile(project.Id, new FileDto
            {
                Path = "Programxx.cs",
                Content =
@"using System;
namespace MyProject {
    public class Proasdgram {
        public static void Mainasd(string[] args) {
            Console.WriteLine(""test"");
        }
    }
}
",
                Type = FileType.CSharp
            });
            AddFile(project.Id, new FileDto
            {
                Path = "SomeFolder/Program2.cs",
                Content =
      @"using System;
namespace MyProject {
    public class Program2 {
        public static void SomeMethod() {
            Console.WriteLine(""test2"");
        }
    }
}
",
                Type = FileType.CSharp
            });

            _compilation = CSharpCompilation.Create(_workspace.CurrentSolution.Projects.First().AssemblyName)
                .WithOptions(new CSharpCompilationOptions(
                outputKind: OutputKind.ConsoleApplication,
                optimizationLevel: OptimizationLevel.Debug
                ))
                .WithReferences(_coreReferences);

            return GetSolutionDto();
        }

        public ProjectDto AddProject(ProjectDto projectDto)
        {
            var pi = ProjectInfo.Create(
                ProjectId.CreateNewId(),
                VersionStamp.Create(DateTime.UtcNow),
                projectDto.Name,
                projectDto.Name,
                LanguageNames.CSharp
                );
            var newSolution = _workspace.CurrentSolution.AddProject(pi);
            _workspace.TryApplyChanges(newSolution);
            projectDto.Id = pi.Id.Id.ToString();
            return projectDto;
        }

        public FileDto AddFile(string projectId, FileDto fileDto)
        {
            var projectGuid = ProjectId.CreateFromSerialized(new Guid(projectId));
            var docId = DocumentId.CreateNewId(projectGuid);
            var sln = _workspace.CurrentSolution.AddDocument(docId, Path.GetFileName(fileDto.Path), SourceText.From(fileDto.Content, Encoding.UTF8),
                 null, fileDto.Path);
            fileDto.Id = docId.Id.ToString();
            fileDto.ProjectId = projectId;
            _workspace.TryApplyChanges(sln);
            return fileDto;
        }

        public async Task<FileDto> GetFileContent(string projectId, string fileId)
        {
            await Task.CompletedTask;
            var doc = _workspace.CurrentSolution.GetDocument(DocumentId.CreateFromSerialized(ProjectId.CreateFromSerialized(new Guid(projectId)), new Guid(fileId)));
            return new FileDto
            {
                Content = (await doc.GetTextAsync()).ToString(),
                Id = doc.Id.Id.ToString(),
                ProjectId = doc.Project.Id.Id.ToString(),
                Path = doc.FilePath,
                Type = FileType.CSharp
            };
        }

        public async Task<FileDto> UpdateFile(FileDto file)
        {
            await Task.CompletedTask;
            var sln = _workspace.CurrentSolution.RemoveDocument(DocumentId.CreateFromSerialized(ProjectId.CreateFromSerialized(new Guid(file.ProjectId)), new Guid(file.Id)));
            _workspace.TryApplyChanges(sln);
            return AddFile(file.ProjectId, file);
        }

        public async Task<ResultDto> Build()
        {
            var strees = new List<SyntaxTree>();
            foreach (var d in _workspace.CurrentSolution.Projects.First().Documents)
            {
                strees.Add(await d.GetSyntaxTreeAsync());
            }
            using var peStream = new MemoryStream();
            using var pdbStream = new MemoryStream();
            var emitResult = _compilation.AddSyntaxTrees(strees)
                .Emit(peStream, pdbStream);
            if (emitResult.Success)
            {
                _peBytes = peStream.ToArray();
                _pdbBytes = pdbStream.ToArray();
            }
            return new ResultDto
            {
                Success = emitResult.Success,
                ConsoleMessages = emitResult.Diagnostics.Select(d => new ConsoleMessageDto
                {
                    Type = (ConsoleMessageType)d.Severity,
                    Line = d.Location?.GetMappedLineSpan().StartLinePosition.Line + 1,
                    Column = d.Location?.GetMappedLineSpan().StartLinePosition.Character + 1,
                    Code = d.Id,
                    FilePath = d.Location.SourceTree?.FilePath,
                    Message = d.GetMessage()
                }).ToList()
            };
        }

        public async Task<ResultDto> Run()
        {
            if (_peBytes == null)
            {
                return new ResultDto
                {
                    Success = false,
                    ConsoleMessages = new []
                    {
                        new ConsoleMessageDto
                        {
                             Type = ConsoleMessageType.Warning,
                             Message = "You must build the project first"
                        }
                    }
                };
            }

            var asm = Assembly.Load(_peBytes);
            using var osw = new StringWriter();
            using var esw = new StringWriter();
            Console.SetOut(osw);
            Console.SetError(esw);
            var errors = new List<ConsoleMessageDto>();
            var output = new List<ConsoleMessageDto>();
            try
            {
                if (asm.EntryPoint.GetParameters().Length > 0)
                {
                    asm.EntryPoint.Invoke(null, asm.EntryPoint.GetParameters().Select(p => GetDefault(p.ParameterType)).ToArray());
                }
                else
                {
                    asm.EntryPoint.Invoke(null, null);
                }
                await Task.CompletedTask;
                errors = esw.GetStringBuilder().ToString().Split(Environment.NewLine).Select(x => new ConsoleMessageDto { 
                    Message = x,
                    Type = ConsoleMessageType.Error
                }).ToList();
                output = osw.GetStringBuilder().ToString().Split(Environment.NewLine).Select(x => new ConsoleMessageDto
                {
                    Message = x,
                    Type = ConsoleMessageType.Info
                }).ToList();
                var concat = output.Union(errors);
                return new ResultDto
                {
                    Success = errors.Count > 0,
                    ConsoleMessages = concat
                };
            }
            catch (Exception e)
            {
                var concat = output.Union(errors).ToList();
                concat.Add(new ConsoleMessageDto { 
                    Message = e.InnerException.Message,
                    Type = ConsoleMessageType.Error
                });
                concat.Add(new ConsoleMessageDto
                {
                    Message = e.InnerException.StackTrace,
                    Type = ConsoleMessageType.Error
                });
                return new ResultDto
                {
                    Success = false,
                    ConsoleMessages = concat
                };
            }
            finally
            {
                Console.SetOut(Console.Out);
                Console.SetError(Console.Error);
            }
        }

        public async Task<MonacoCompletionListDto> GetCompletions(string projectId, string fileId, int index, string currentSource)
        {
            var doc = _workspace.CurrentSolution.GetDocument(DocumentId.CreateFromSerialized(
                ProjectId.CreateFromSerialized(new Guid(projectId)),
                new Guid(fileId)
                )).WithText(SourceText.From(currentSource, Encoding.UTF8));
            var completionService = CompletionService.GetService(doc);
            var cl = await completionService.GetCompletionsAsync(doc, index);
            return new MonacoCompletionListDto
            {
                 Incomplete = false,
                 Suggestions = cl.Items.Select(x => new MonacoCompletionItemDto { 
                    Kind = x.Properties != null && x.Properties.ContainsKey("SymbolKind") ?
                        Convert((SymbolKind)Enum.Parse(typeof(SymbolKind), x.Properties["SymbolKind"])) : MonacoCompletionItemKind.Text,
                    Label = x.DisplayText,
                    InsertText = x.DisplayText,
                    FilterText = x.FilterText,
                    Detail = x.InlineDescription,
                    SortText = x.SortText
                 }).ToList()
            };
        }

        private static MonacoCompletionItemKind Convert(SymbolKind symbolKind)
        {
            switch (symbolKind)
            {
                case SymbolKind.TypeParameter:
                    return MonacoCompletionItemKind.TypeParameter;
                case SymbolKind.Method:
                    return MonacoCompletionItemKind.Method;
                case SymbolKind.Property:
                    return MonacoCompletionItemKind.Property;
                case SymbolKind.Field:
                    return MonacoCompletionItemKind.Field;
                case SymbolKind.Event:
                    return MonacoCompletionItemKind.Event;
                case SymbolKind.Parameter:
                    return MonacoCompletionItemKind.Variable;
                case SymbolKind.Local:
                    return MonacoCompletionItemKind.Variable;
                case SymbolKind.Label:
                    return MonacoCompletionItemKind.Text;
                case SymbolKind.Namespace:
                    return MonacoCompletionItemKind.Module;
                case SymbolKind.NamedType:
                    return MonacoCompletionItemKind.Class;
                case SymbolKind.ErrorType:
                    return MonacoCompletionItemKind.Class;
                case SymbolKind.ArrayType:
                    return MonacoCompletionItemKind.Class;
                case SymbolKind.PointerType:
                    return MonacoCompletionItemKind.Reference;
                case SymbolKind.Assembly:
                    return MonacoCompletionItemKind.Module;
                case SymbolKind.NetModule:
                    return MonacoCompletionItemKind.Module;
                case SymbolKind.Discard:
                    return MonacoCompletionItemKind.Variable;
                case SymbolKind.DynamicType:
                    return MonacoCompletionItemKind.Class;
                case SymbolKind.Preprocessing:
                    return MonacoCompletionItemKind.Constant;
                case SymbolKind.RangeVariable:
                    return MonacoCompletionItemKind.Variable;
            }
            return MonacoCompletionItemKind.Text;
        }

        public void SetConfig(ConfigDto dto)
        {
            _config = dto;
        }

        #region privates

        private async Task Preload()
        {
            var _ = typeof(SQLitePCL.SafeGCHandle);
            var __ = typeof(Microsoft.CodeAnalysis.CSharp.Formatting.CSharpFormattingOptions);
            await GetRequiredReferences();
        }

        private SolutionDto GetSolutionDto()
        {
            var solutionDto = new SolutionDto
            {
                Id = _workspace.CurrentSolution.Id.Id.ToString(),
                Name = _solutionName,
                Projects = new List<ProjectDto>()
            };
            foreach (var p in _workspace.CurrentSolution.Projects)
            {
                var newProject = new ProjectDto
                {
                    Id = p.Id.Id.ToString(),
                    Name = p.Name,
                    Files = new List<FileDto>()
                };
                foreach (var d in p.Documents)
                {
                    var newDoc = new FileDto
                    {
                        Id = d.Id.Id.ToString(),
                        Path = d.FilePath,
                        Type = FileType.CSharp,
                        ProjectId = newProject.Id
                    };
                    newProject.Files.Add(newDoc);
                }
                solutionDto.Projects.Add(newProject);
            }
            return solutionDto;
        }

        private async Task GetRequiredReferences()
        {
            _coreReferences = new List<MetadataReference>();
            var list = new string[] {
                "mscorlib.dll",
                "System.dll",
                "System.Runtime.dll",
                "netstandard.dll",
                "Microsoft.CodeAnalysis.CSharp.Features.dll"
            };
            foreach (var dll in list)
            {
                var bytes = await DllFetcher.GetDllBytes(_config, dll);
                Assembly.Load(bytes);
                _coreReferences.Add(MetadataReference.CreateFromImage(bytes));
            }
        }

        private static object GetDefault(Type type)
        {
            if (type.IsValueType)
            {
                return Activator.CreateInstance(type);
            }
            return null;
        }

        #endregion
    }
}
