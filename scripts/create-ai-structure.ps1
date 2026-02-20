param(
	[Parameter(Mandatory = $false)]
	[string]$WorkspacePath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-UniqueTargetPath {
	param(
		[Parameter(Mandatory = $true)]
		[string]$BasePath
	)

	if (-not (Test-Path -LiteralPath $BasePath)) {
		return $BasePath
	}

	$index = 2
	while ($true) {
		$candidate = "$BasePath" + "_$index"
		if (-not (Test-Path -LiteralPath $candidate)) {
			return $candidate
		}
		$index++
	}
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$templateRoot = Join-Path $repoRoot "AI_structure"

if (-not (Test-Path -LiteralPath $templateRoot -PathType Container)) {
	throw "Template non trovato: $templateRoot"
}

if ([string]::IsNullOrWhiteSpace($WorkspacePath)) {
	$WorkspacePath = (Get-Location).Path
}

$workspaceRoot = [System.IO.Path]::GetFullPath($WorkspacePath)
if (-not (Test-Path -LiteralPath $workspaceRoot -PathType Container)) {
	throw "Workspace path non valida: $workspaceRoot"
}

$targetAiPath = Join-Path $workspaceRoot "AI"
$backupBasePath = Join-Path $workspaceRoot "AI_new"

if (Test-Path -LiteralPath $targetAiPath -PathType Container) {
	$backupPath = Get-UniqueTargetPath -BasePath $backupBasePath
	Rename-Item -LiteralPath $targetAiPath -NewName (Split-Path -Leaf $backupPath)
}

New-Item -ItemType Directory -Path $targetAiPath -Force | Out-Null
Copy-Item -Path (Join-Path $templateRoot "*") -Destination $targetAiPath -Recurse -Force

Write-Output "Struttura AI creata in: $targetAiPath"
