using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetZero.Engine.Dto
{
    public class MonacoCompletionItemDto
    {
        public string Label { get; set; }
        public MonacoCompletionItemKind Kind { get; set; }
        public IEnumerable<MonacoCompletionItemTag> Tags { get; set; }
        public string Detail { get; set; }
        public string Documentation { get; set; }
        public string SortText { get; set; }
        public string FilterText { get; set; }
        public bool? Preselect { get; set; }
        public string InsertText { get; set; }
        public IEnumerable<MonacoCompletionItemInsertTextRule> InsertTextRules { get; set; }
        public MonacoIRange Range { get; set; }
        public IEnumerable<string> CommitCharacters { get; set; }
        public IEnumerable<MonacoISingleEditOperation> AdditionalTextEdits { get; set; }
        public MonacoCommand Command { get; set; }
    }
}
